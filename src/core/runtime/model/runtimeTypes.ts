import { PromptPackage } from '../../promptAssembly/promptTypes';

export enum ModelState {
  NotLoaded = 'NotLoaded',
  Loading = 'Loading',
  Ready = 'Ready',
  Busy = 'Busy',
  Unloading = 'Unloading',
  Failed = 'Failed'
}

export interface ModelConfig {
  modelId: string;
  name: string;
  provider: string;
  contextWindow: number;
  parametersCount?: string;
  fileSizeGb?: number;
}

export interface GenerationConfig {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface InferenceResult {
  id: string;
  sessionId: string;
  tokensGenerated: number;
  finishReason: 'stop' | 'length' | 'cancelled';
  latencyMs: number;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  response: string;
}

export interface InferenceSession {
  sessionId: string;
  modelId: string;
  createdAt: number;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export enum RuntimeEventType {
  ModelLoading = 'ModelLoading',
  ModelLoaded = 'ModelLoaded',
  InferenceStarted = 'InferenceStarted',
  TokenGenerated = 'TokenGenerated',
  InferenceCompleted = 'InferenceCompleted',
  InferenceCancelled = 'InferenceCancelled',
  RuntimeError = 'RuntimeError'
}

export interface RuntimeEvent {
  type: RuntimeEventType;
  modelId: string;
  timestamp: number;
  payload?: any;
}

export type RuntimeEventListener = (event: RuntimeEvent) => void;
