import type { SessionMemory, ProfileState, ActionState, DialogueState } from './types.js';

const MAX_HISTORY = 20; // 10 rounds = 20 messages

const sessions = new Map<string, SessionMemory>();

function defaultProfile(): ProfileState {
  return { health_goals: [], constraints: [], indicators: {} };
}

function defaultAction(): ActionState {
  return { has_active_plan: false, current_plan: null, plan_status: null };
}

function defaultDialogue(): DialogueState {
  return { current_topic: '', current_stage: 'idle', pending_intent: null };
}

export function getSession(sessionId: string): SessionMemory {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      profile: defaultProfile(),
      action: defaultAction(),
      dialogue: defaultDialogue(),
      history: [],
    });
  }
  return sessions.get(sessionId)!;
}

export function updateSession(sessionId: string, updates: Partial<SessionMemory>): void {
  const current = getSession(sessionId);
  const merged = { ...current, ...updates };

  if (merged.history.length > MAX_HISTORY) {
    merged.history = merged.history.slice(-MAX_HISTORY);
  }

  sessions.set(sessionId, merged);
}
