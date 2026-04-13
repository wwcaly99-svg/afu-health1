import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSession, updateSession } from './state.js';
import { buildControllerPrompt, buildSpeakerPrompt } from './prompts.js';
import { callClaudeBlocking, callClaudeStream } from './claude.js';
import { executePlanGenerator, executePlanAdjuster, executeProfileUpdater } from './executor.js';
import type {
  ChatRequest, ControllerOutput, ActionType, PlanPreview, ProfileHint, PlanItem,
} from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

let reqCounter = 0;

function parseControllerOutput(raw: string): ControllerOutput {
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(cleaned.slice(start, end + 1)) as ControllerOutput;
  }
  return JSON.parse(cleaned) as ControllerOutput;
}

function buildPlanPreview(items: PlanItem[], actionType: ActionType): PlanPreview | null {
  if (actionType !== 'plan' && actionType !== 'adjust') return null;
  if (!items || items.length === 0) return null;
  return {
    title: actionType === 'adjust' ? '调整后的轻量版' : '起步计划',
    period_text: actionType === 'adjust' ? '先按轻量版执行' : '未来 3 天',
    items_preview: items.map((i) => i.action),
    primary_action: '查看详情',
  };
}

function buildProfileHint(updates: Partial<Record<string, unknown>>): ProfileHint | null {
  const records: string[] = [];
  const indicators = updates.indicators as Record<string, unknown> | undefined;
  if (indicators) {
    for (const [k, v] of Object.entries(indicators)) {
      const val = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v);
      records.push(`${k}: ${val}`);
    }
  }
  const constraints = updates.constraints as unknown[] | undefined;
  if (constraints) {
    for (const c of constraints) records.push(typeof c === 'string' ? c : String(c));
  }
  const goals = updates.health_goals as unknown[] | undefined;
  if (goals) {
    for (const g of goals) records.push(`目标：${typeof g === 'string' ? g : String(g)}`);
  }
  if (records.length === 0) return null;
  return { title: '识别到可沉淀的健康信息', records: records.slice(0, 4), primary_action: '保存到档案' };
}

app.post('/api/feedback', (req, res) => {
  const { session_id, message_index, action_type, rating } = req.body as {
    session_id: string; message_index: number; action_type: string; rating: string;
  };
  console.log(`[feedback] session=${session_id} index=${message_index} action=${action_type} rating=${rating}`);
  res.json({ ok: true });
});

app.post('/api/chat', async (req, res) => {
  const rid = `req-${++reqCounter}`;
  const t0 = performance.now();

  try {
    const { session_id, message } = req.body as ChatRequest;
    if (!session_id || !message) {
      res.status(400).json({ error: 'session_id and message are required' });
      return;
    }

    console.log(`\n[${rid}] ── /api/chat ──`);
    console.log(`[${rid}] session: ${session_id}`);
    console.log(`[${rid}] message: "${message.slice(0, 80)}"`);

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    req.socket.setNoDelay(true);
    res.flushHeaders();

    const write = (obj: Record<string, unknown>) => {
      res.write(JSON.stringify(obj) + '\n');
    };

    // 1. Read session
    const memory = getSession(session_id);
    console.log(`[${rid}] Profile:`, JSON.stringify(memory.profile));
    console.log(`[${rid}] History: ${memory.history.length} messages`);

    // 2. Status
    write({ type: 'status', text: '正在思考...' });

    // 3. Controller LLM (blocking)
    const t1 = performance.now();
    const controllerPrompt = buildControllerPrompt(memory, message);
    let controllerRaw: string;
    try {
      controllerRaw = await callClaudeBlocking(controllerPrompt, [
        { role: 'user', content: message },
      ]);
    } catch (err) {
      console.error(`[${rid}] Controller call failed:`, err);
      controllerRaw = JSON.stringify({
        in_domain: true, action_type: 'answer', reply_mode: 'direct',
        execute_task: null, core_content: message, tone: 'warm',
        quick_actions: null,
        state_updates: { profile: {}, action: {}, dialogue: {} },
      });
    }
    const t2 = performance.now();
    console.log(`[${rid}] Controller: ${(t2 - t1).toFixed(0)}ms`);
    console.log(`[${rid}] Controller raw:`, controllerRaw);

    // 4. Parse controller output
    let ctrl: ControllerOutput;
    try {
      ctrl = parseControllerOutput(controllerRaw);
      console.log(`[${rid}] action=${ctrl.action_type} mode=${ctrl.reply_mode} task=${ctrl.execute_task}`);
    } catch {
      console.warn(`[${rid}] Controller parse failed, fallback`);
      ctrl = {
        in_domain: true, action_type: 'answer', reply_mode: 'direct',
        execute_task: null, core_content: controllerRaw, tone: 'warm',
        quick_actions: null,
        state_updates: { profile: {}, action: {}, dialogue: {} },
      };
    }

    // 5. Send thinking event
    const actionLabels: Record<string, string> = {
      answer: '解答问题', answer_plus: '解答并引导', guide: '给出起步建议',
      plan: '制定健康计划', adjust: '调整现有计划',
    };
    const taskLabels: Record<string, string> = {
      plan_generator: '计划生成模块', plan_adjuster: '计划调整模块', profile_updater: '档案更新模块',
    };
    const thinkingSteps: string[] = [];
    thinkingSteps.push(`识别意图：${actionLabels[ctrl.action_type] || ctrl.action_type}`);
    const stateUpdates = ctrl.state_updates || { profile: {}, action: {}, dialogue: {} };
    const profileUpdates = stateUpdates.profile || {};
    const pIndicators = profileUpdates.indicators as Record<string, string> | undefined;
    if (pIndicators && Object.keys(pIndicators).length > 0) {
      thinkingSteps.push(`检测到健康指标：${Object.entries(pIndicators).map(([k, v]) => `${k} ${v}`).join('、')}`);
    }
    const pConstraints = profileUpdates.constraints as string[] | undefined;
    if (pConstraints && pConstraints.length > 0) {
      thinkingSteps.push(`记录限制条件：${pConstraints.join('、')}`);
    }
    const pGoals = profileUpdates.health_goals as string[] | undefined;
    if (pGoals && pGoals.length > 0) {
      thinkingSteps.push(`更新健康目标：${pGoals.join('、')}`);
    }
    if (ctrl.execute_task) {
      thinkingSteps.push(`调用模块：${taskLabels[ctrl.execute_task] || ctrl.execute_task}`);
    }
    thinkingSteps.push('生成回复中...');
    write({ type: 'thinking', steps: thinkingSteps, core_content: ctrl.core_content });

    // 6. Apply state updates
    if (Object.keys(profileUpdates).length > 0) {
      const current = getSession(session_id).profile;

      // Merge a list by replacing semantically-contained old entries with new ones
      const mergeList = (existing: string[], incoming: string[]): string[] => {
        if (!incoming || incoming.length === 0) return existing;
        let result = [...existing];
        for (const newItem of incoming) {
          // Remove old entries that are substrings of (i.e. contained by) the new item
          result = result.filter((old) => !newItem.includes(old));
          // Only add if not already present
          if (!result.includes(newItem)) result.push(newItem);
        }
        return result;
      };

      updateSession(session_id, {
        profile: {
          ...current,
          indicators: { ...current.indicators, ...(profileUpdates.indicators as Record<string, string> || {}) },
          constraints: mergeList(current.constraints, profileUpdates.constraints as string[] || []),
          health_goals: mergeList(current.health_goals, profileUpdates.health_goals as string[] || []),
        },
      });
    }
    if (Object.keys(stateUpdates.dialogue || {}).length > 0) {
      updateSession(session_id, { dialogue: { ...memory.dialogue, ...stateUpdates.dialogue } });
    }

    // 6. Execute if needed
    let planItems: PlanItem[] = [];
    if (ctrl.reply_mode === 'execute' && ctrl.execute_task) {
      const t3 = performance.now();
      if (ctrl.execute_task === 'plan_generator') {
        planItems = await executePlanGenerator(getSession(session_id));
        updateSession(session_id, {
          action: { has_active_plan: true, current_plan: planItems, plan_status: 'active' },
        });
        ctrl.core_content += '\n\n计划条目：\n' + planItems.map((p) => `- ${p.action}（${p.frequency}）`).join('\n');
      } else if (ctrl.execute_task === 'plan_adjuster') {
        planItems = await executePlanAdjuster(getSession(session_id));
        updateSession(session_id, {
          action: { has_active_plan: true, current_plan: planItems, plan_status: 'adjusting' },
        });
        ctrl.core_content += '\n\n调整后条目：\n' + planItems.map((p) => `- ${p.action}（${p.frequency}）`).join('\n');
      } else if (ctrl.execute_task === 'profile_updater') {
        const pu = executeProfileUpdater(getSession(session_id), stateUpdates.profile as Record<string, unknown>);
        updateSession(session_id, { profile: { ...getSession(session_id).profile, ...pu } });
      }
      console.log(`[${rid}] Executor: ${ctrl.execute_task} ${(performance.now() - t3).toFixed(0)}ms`);
    }

    if (Object.keys(stateUpdates.action || {}).length > 0) {
      const currentAction = getSession(session_id).action;
      updateSession(session_id, { action: { ...currentAction, ...stateUpdates.action } });
    }

    // 7. Speaker LLM (streaming)
    const speakerPrompt = buildSpeakerPrompt(ctrl.core_content, ctrl.tone, ctrl.action_type, getSession(session_id));
    const t4 = performance.now();
    let fullReply = '';

    try {
      const streamRes = await callClaudeStream(speakerPrompt, [
        { role: 'user', content: '请根据核心内容生成回复。' },
      ]);

      const reader = streamRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]' || !raw) continue;

          try {
            const evt = JSON.parse(raw) as Record<string, unknown>;
            if (evt.type === 'content_block_delta') {
              const delta = (evt.delta as Record<string, unknown>)?.text as string || '';
              if (delta) {
                fullReply += delta;
                write({ type: 'delta', text: delta });
              }
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[${rid}] Speaker stream failed: ${errMsg}`);
      fullReply = ctrl.core_content;
      write({ type: 'delta', text: fullReply });
    }

    const t5 = performance.now();
    console.log(`[${rid}] Speaker: ${(t5 - t4).toFixed(0)}ms | reply_len=${fullReply.length}`);
    console.log(`[${rid}] Reply: ${fullReply}`);

    // 8. Update history
    const updatedMemory = getSession(session_id);
    updateSession(session_id, {
      history: [...updatedMemory.history, { role: 'user', content: message }, { role: 'assistant', content: fullReply }],
    });

    // 9. Done event
    const finalMemory = getSession(session_id);
    write({
      type: 'done',
      payload: {
        action_type: ctrl.action_type,
        reply_text: fullReply,
        meta: {
          current_topic: finalMemory.dialogue.current_topic,
          current_stage: finalMemory.dialogue.current_stage,
          has_active_plan: finalMemory.action.has_active_plan,
        },
        plan_preview: buildPlanPreview(planItems, ctrl.action_type as ActionType),
        profile_hint: buildProfileHint(stateUpdates.profile || {}),
        conversation_id: session_id,
        quick_actions: ctrl.quick_actions || null,
      },
    });
    res.end();

    const ms = (a: number, b: number) => (b - a).toFixed(0);
    console.log(`[${rid}] ⏱ controller=${ms(t1, t2)}ms speaker=${ms(t4, t5)}ms total=${ms(t0, performance.now())}ms`);

  } catch (err) {
    const elapsed = (performance.now() - t0).toFixed(0);
    console.error(`[${rid}] ❌ Error after ${elapsed}ms:`, err instanceof Error ? err.message : err);
    if (res.headersSent) {
      res.write(JSON.stringify({ type: 'error', error: err instanceof Error ? err.message : 'Unknown error' }) + '\n');
      res.end();
    } else {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
});

// SPA fallback — serve index.html for non-API routes
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
});
