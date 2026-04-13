import { callClaudeBlocking } from './claude.js';
import type { SessionMemory, PlanItem, ProfileState } from './types.js';

function parseItems(raw: string): PlanItem[] {
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  try {
    const data = JSON.parse(cleaned);
    const items = Array.isArray(data) ? data : data.items;
    if (!Array.isArray(items)) return fallbackPlan();
    return items.map((item: Record<string, string>) => ({
      action: String(item.action || ''),
      frequency: String(item.frequency || '每天'),
      difficulty: (['easy', 'medium', 'hard'].includes(item.difficulty) ? item.difficulty : 'easy') as PlanItem['difficulty'],
    })).filter((i) => i.action.length > 0);
  } catch {
    return fallbackPlan();
  }
}

function fallbackPlan(): PlanItem[] {
  return [
    { action: '从最容易的一步开始调整', frequency: '每天', difficulty: 'easy' },
    { action: '保持三餐规律', frequency: '每天', difficulty: 'easy' },
  ];
}

export async function executePlanGenerator(memory: SessionMemory): Promise<PlanItem[]> {
  const prompt = `你是一个健康计划生成器。根据用户档案生成 3 条低门槛、可立即执行的 3 天短期计划。

用户档案：
- 健康目标: ${JSON.stringify(memory.profile.health_goals)}
- 约束条件: ${JSON.stringify(memory.profile.constraints)}
- 健康指标: ${JSON.stringify(memory.profile.indicators)}
- 当前主题: ${memory.dialogue.current_topic}

规则：
1. 计划周期固定为 3 天，不要生成一周或两周的计划
2. 任务数量固定 3 条，不要超过 4 条
3. 每条任务一句话描述，简短清晰，不要长篇大论
4. 每条任务开头加一个合适的 emoji（🍽️饮食 🚶运动 😴睡眠 💧饮水 📊监测，根据内容选）
5. 优先从饮食、活动、作息中选最容易的
6. 考虑用户的约束条件（比如下班晚就不要安排晚间长时间运动）
7. difficulty: easy=几乎不用额外努力, medium=需要一点意志力, hard=需要较大改变
8. 不要使用 markdown 格式，不要用 **加粗**、## 标题、--- 分隔线，只用 emoji 和文字

请只输出 JSON 数组：
[{"action":"具体动作","frequency":"每天/隔天/每周X次","difficulty":"easy|medium|hard"}]`;

  try {
    const raw = await callClaudeBlocking(prompt, [
      { role: 'user', content: '请生成计划' },
    ]);
    const items = parseItems(raw);
    return items.length > 0 ? items : fallbackPlan();
  } catch (err) {
    console.error('[executor] plan_generator failed:', err);
    return fallbackPlan();
  }
}

export async function executePlanAdjuster(memory: SessionMemory): Promise<PlanItem[]> {
  const currentPlan = memory.action.current_plan || [];
  const prompt = `你是一个健康计划调整器。用户觉得当前计划太难，需要调轻为 3 天轻量版。

当前计划：
${JSON.stringify(currentPlan)}

用户档案：
- 约束条件: ${JSON.stringify(memory.profile.constraints)}
- 健康指标: ${JSON.stringify(memory.profile.indicators)}

规则：
1. 计划周期固定为 3 天
2. 输出 2 条任务，保留最核心的动作，删掉最难的
3. 把保留的动作调得更轻、更容易执行
4. 每条任务一句话描述，简短清晰，不要长篇大论
5. 每条任务开头加一个合适的 emoji（🍽️饮食 🚶运动 😴睡眠 💧饮水 📊监测，根据内容选）
6. 考虑用户的约束条件
7. 所有 difficulty 尽量是 easy
8. 不要使用 markdown 格式，不要用 **加粗**、## 标题、--- 分隔线，只用 emoji 和文字

请只输出 JSON 数组：
[{"action":"调整后的具体动作","frequency":"每天/隔天","difficulty":"easy|medium"}]`;

  try {
    const raw = await callClaudeBlocking(prompt, [
      { role: 'user', content: '请调整计划' },
    ]);
    const items = parseItems(raw);
    return items.length > 0 ? items : fallbackAdjust();
  } catch (err) {
    console.error('[executor] plan_adjuster failed:', err);
    return fallbackAdjust();
  }
}

function fallbackAdjust(): PlanItem[] {
  return [
    { action: '先只做最容易的一步', frequency: '每天', difficulty: 'easy' },
    { action: '其他的先放一放', frequency: '每天', difficulty: 'easy' },
  ];
}

export function executeProfileUpdater(
  memory: SessionMemory,
  updates: Record<string, unknown>
): Partial<ProfileState> {
  const result: Partial<ProfileState> = {};

  if (updates.indicators && typeof updates.indicators === 'object') {
    result.indicators = {
      ...memory.profile.indicators,
      ...(updates.indicators as Record<string, string>),
    };
  }
  if (Array.isArray(updates.constraints)) {
    const existing = new Set(memory.profile.constraints);
    for (const c of updates.constraints) {
      existing.add(String(c));
    }
    result.constraints = [...existing];
  }
  if (Array.isArray(updates.health_goals)) {
    const existing = new Set(memory.profile.health_goals);
    for (const g of updates.health_goals) {
      existing.add(String(g));
    }
    result.health_goals = [...existing];
  }

  return result;
}
