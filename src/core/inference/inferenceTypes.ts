import { PromptPackage } from '../promptAssembly/promptTypes';

export enum SessionState {
  Created = 'Created',
  Queued = 'Queued',
  Running = 'Running',
  Streaming = 'Streaming',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Failed = 'Failed'
}

export interface InferenceRequestModel {
  requestId: string;
  sessionId: string;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  workspaceContext?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  seed?: number;
  maxTokens?: number;
  stopTokens?: string[];
  streaming?: boolean;
}

export interface PipelineMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  tokensPerSec: number;
  timeToFirstTokenMs?: number;
}

export interface InferenceResponseModel {
  responseId: string;
  sessionId: string;
  text: string;
  finishReason: 'stop' | 'length' | 'cancelled';
  metrics: PipelineMetrics;
}

export interface PipelineSession {
  sessionId: string;
  modelId: string;
  createdAt: number;
  state: SessionState;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  error?: string;
}

export enum InferenceEventType {
  RequestReceived = 'RequestReceived',
  RequestCompiled = 'RequestCompiled',
  SessionTransition = 'SessionTransition',
  TokenEmitted = 'TokenEmitted',
  InferenceCompleted = 'InferenceCompleted',
  InferenceCancelled = 'InferenceCancelled',
  InferenceError = 'InferenceError',
  MetricsPublished = 'MetricsPublished'
}

export interface InferenceEvent {
  type: InferenceEventType;
  sessionId: string;
  timestamp: number;
  payload?: any;
}

export type InferenceEventListener = (event: InferenceEvent) => void;

export interface InferenceExecutionReport {
  reportId: string;
  sessionId: string;
  timestamp: number;
  request: InferenceRequestModel;
  response?: InferenceResponseModel;
  state: SessionState;
  metrics?: PipelineMetrics;
}
