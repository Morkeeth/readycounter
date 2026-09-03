export type AgentProvider = 'openai' | 'openrouter';
export type AgentTrialStatus = 'running' | 'completed' | 'error';

export interface AgentTrialCall {
  callId: string;
  name: string;
  arguments: string;
  result?: string;
  blocked?: boolean;
}

export interface AgentTrialSummary {
  callCount: number;
  searched: boolean;
  productRead: boolean;
  cartChanged: boolean;
  checkoutReached: boolean;
  blocked: boolean;
  blocker: string | null;
}

/** Public, persistent evidence for one model-driven store trial. */
export interface AgentTrialReceipt {
  id: string;
  status: AgentTrialStatus;
  goal: string;
  storeId: string;
  storeName: string;
  storeSource: string;
  provider: AgentProvider;
  model: string;
  promptVersion: string;
  createdAt: string;
  completedAt: string | null;
  finalMessage: string | null;
  calls: AgentTrialCall[];
  summary: AgentTrialSummary;
}
