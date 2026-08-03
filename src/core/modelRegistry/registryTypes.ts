export enum ModelCapability {
  Chat = 'Chat',
  CodeGeneration = 'Code Generation',
  CodeReview = 'Code Review',
  CodeCompletion = 'Code Completion',
  FunctionCalling = 'Function Calling',
  ToolCalling = 'Tool Calling',
  LongContext = 'Long Context',
  Reasoning = 'Reasoning',
  Vision = 'Vision',
  Embedding = 'Embedding',
  RAG = 'RAG',
  Planning = 'Planning'
}

export enum ModelState {
  Discovered = 'Discovered',
  Registered = 'Registered',
  Validated = 'Validated',
  Ready = 'Ready',
  Deprecated = 'Deprecated',
  Unavailable = 'Unavailable',
  Corrupted = 'Corrupted'
}

export interface ModelInfo {
  modelId: string;
  displayName: string;
  provider: string;
  architecture: string;
  format: 'gguf' | 'onnx' | 'mlx' | 'custom' | string;
  version: string;
  parameters: string;
  quantization: string;
  contextLength: number;
  tokenizer: string;
  memoryRequirementGb: number;
  diskSizeGb: number;
  languages: string[];
  capabilities: ModelCapability[];
  healthStatus: 'Healthy' | 'Degraded' | 'Unhealthy';
  state: ModelState;
  path?: string;
}

export enum RegistryEventType {
  ScanStarted = 'ScanStarted',
  ScanCompleted = 'ScanCompleted',
  ModelRegistered = 'ModelRegistered',
  ModelUnregistered = 'ModelUnregistered',
  ModelValidated = 'ModelValidated',
  ModelHealthUpdated = 'ModelHealthUpdated',
  RegistryError = 'RegistryError'
}

export interface RegistryEvent {
  type: RegistryEventType;
  modelId?: string;
  timestamp: number;
  payload?: any;
}

export type RegistryEventListener = (event: RegistryEvent) => void;

export interface CapabilityReport {
  modelId: string;
  supported: ModelCapability[];
  unsupported: ModelCapability[];
  confidenceScore: number;
}

export interface CompatibilityReport {
  modelId: string;
  compatible: boolean;
  issues: string[];
  warnings: string[];
  requiredRamGb: number;
  availableRamGb: number;
}

export interface RegistryHealthReport {
  timestamp: number;
  totalModels: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  issues: Array<{ modelId: string; status: string; detail: string }>;
}

export interface RegistryMetrics {
  totalScans: number;
  lastScanDurationMs: number;
  registryLoadTimeMs: number;
  cacheHitRate: number;
}
