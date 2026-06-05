import { PromptPackage } from '../promptAssembly/promptTypes';

export enum ModelState {
  Registered = 'Registered',
  Loading = 'Loading',
  Loaded = 'Loaded',
  Ready = 'Ready',
  Running = 'Running',
  Idle = 'Idle',
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
  path?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export interface RuntimeContext {
  runtimeId: string;
  startTime: number;
  workspacePath: string;
  environment: Record<string, string>;
  maxMemoryBytes?: number;
  maxVramBytes?: number;
  threadLimit?: number;
}

export interface WorkspaceContext {
  workspaceId: string;
  rootPath: string;
  activeFiles: string[];
}

export interface InferenceRequest {
  promptPkg: PromptPackage;
  config: GenerationConfig;
  signal?: AbortSignal;
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
  metrics?: InferenceMetrics;
}

export interface ResourceMetrics {
  cpuUsagePct: number;
  gpuUsagePct: number;
  ramUsageMb: number;
  vramUsageMb: number;
  threadsUsed: number;
  contextLength: number;
  inferenceTimeMs: number;
  tokenThroughputTps: number;
}

export interface InferenceMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  tokensPerSec: number;
  timeToFirstTokenMs?: number;
}

export interface InferenceSession {
  sessionId: string;
  modelId: string;
  createdAt: number;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  status: 'active' | 'closed';
}

export enum RuntimeEventType {
  RuntimeInit = 'RuntimeInit',
  ModelRegistered = 'ModelRegistered',
  ModelLoading = 'ModelLoading',
  ModelLoaded = 'ModelLoaded',
  ModelReady = 'ModelReady',
  InferenceStarted = 'InferenceStarted',
  TokenGenerated = 'TokenGenerated',
  InferenceCompleted = 'InferenceCompleted',
  InferenceCancelled = 'InferenceCancelled',
  ModelUnloading = 'ModelUnloading',
  ModelUnloaded = 'ModelUnloaded',
  RuntimeError = 'RuntimeError',
  HealthCheck = 'HealthCheck'
}

export interface RuntimeEvent {
  type: RuntimeEventType;
  modelId?: string;
  timestamp: number;
  payload?: any;
}

export type RuntimeEventListener = (event: RuntimeEvent) => void;

export interface HealthReport {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  timestamp: number;
  checks: {
    memoryOk: boolean;
    vramOk: boolean;
    cpuOk: boolean;
    providerOk: boolean;
    modelsAvailable: boolean;
  };
  details?: string;
}

export interface RuntimeReport {
  reportId: string;
  timestamp: number;
  state: ModelState;
  activeModel?: ModelConfig;
  health: HealthReport;
  metrics: ResourceMetrics;
  queueLength: number;
}
