export type ActionType = 'answer' | 'answer_plus' | 'guide' | 'plan' | 'adjust';

export interface PlanPreview {
  title: string;
  period_text: string;
  items_preview: string[];
  primary_action: string;
}

export interface ProfileHint {
  title: string;
  records: string[];
  primary_action: string;
}

export interface ChatMeta {
  current_topic: string;
  current_stage: string;
  has_active_plan: boolean;
}

export interface ChatResponse {
  action_type: ActionType;
  reply_text: string;
  meta: ChatMeta;
  plan_preview: PlanPreview | null;
  profile_hint: ProfileHint | null;
  conversation_id: string;
}

export interface ChatRequest {
  session_id: string;
  conversation_id?: string;
  message: string;
}

export interface PlanItem {
  action: string;
  frequency: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ProfileState {
  health_goals: string[];
  constraints: string[];
  indicators: Record<string, string>;
}

export interface ActionState {
  has_active_plan: boolean;
  current_plan: PlanItem[] | null;
  plan_status: 'active' | 'adjusting' | 'completed' | null;
}

export interface DialogueState {
  current_topic: string;
  current_stage: 'exploring' | 'guiding' | 'planning' | 'adjusting' | 'idle';
  pending_intent: string | null;
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionMemory {
  profile: ProfileState;
  action: ActionState;
  dialogue: DialogueState;
  history: HistoryMessage[];
}

export interface ControllerOutput {
  in_domain: boolean;
  action_type: ActionType;
  reply_mode: 'direct' | 'execute';
  execute_task: 'plan_generator' | 'plan_adjuster' | 'profile_updater' | null;
  core_content: string;
  tone: 'neutral' | 'warm' | 'encouraging' | 'gentle';
  state_updates: {
    profile: Partial<ProfileState>;
    action: Partial<ActionState>;
    dialogue: Partial<DialogueState>;
  };
}
