export type ModelType =
  | 'Planning Model'
  | 'Coding Model'
  | 'Embedding Model'
  | 'Vision Model'
  | 'Future Local Model'
  | 'Future Kairo Model';

export type ModelHealthStatus = 'Loaded' | 'Ready' | 'Busy' | 'Unavailable' | 'Error';

export interface IModelMetadata {
  readonly modelId: string;
  readonly name: string;
  readonly type: ModelType;
  readonly supportedTasks: readonly string[];
  readonly capabilities: readonly string[];
  readonly contextWindow: number;
  readonly status: ModelHealthStatus;
  readonly priority: number; // Higher number means higher priority
  readonly version: string;
}

export interface IRoutingDecision {
  readonly requestId: string;
  readonly selectedModel: {
    readonly modelId: string;
    readonly name: string;
    readonly type: ModelType;
  };
  readonly modelType: ModelType;
  readonly reason: string;
  readonly fallbackModels: readonly string[];
  readonly metadata: {
    readonly contextWindow: number;
    readonly latencyMs: number;
    readonly capabilities: readonly string[];
  };
}
