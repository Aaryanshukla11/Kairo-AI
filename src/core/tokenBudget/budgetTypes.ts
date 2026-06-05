export enum AllocationStrategy {
  Fixed = 'Fixed',
  Adaptive = 'Adaptive',
  PriorityBased = 'Priority-Based',
  TaskAware = 'Task-Aware',
  ModelAware = 'Model-Aware',
  Dynamic = 'Dynamic'
}

export enum OverflowStrategy {
  Compression = 'Compression',
  Summarization = 'Summarization',
  ChunkRemoval = 'Chunk Removal',
  PriorityTrimming = 'Priority Trimming',
  SlidingWindow = 'Sliding Window',
  MultiPassExecution = 'Multi-Pass Execution'
}

export interface TokenAllocationMap {
  systemPrompt: number;
  developerPrompt: number;
  userPrompt: number;
  workspaceContext: number;
  memory: number;
  conversation: number;
  retrievedContext: number;
  diagnostics: number;
  toolResults: number;
  expectedCompletion: number;
  reservedMargin: number;
}

export interface TokenBudgetReport {
  reportId: string;
  timestamp: number;
  totalBudget: number;
  allocated: number;
  remaining: number;
  expectedCompletion: number;
  safetyMargin: number;
  allocations: TokenAllocationMap;
  isOverflow: boolean;
  warnings: string[];
}

export enum BudgetEventType {
  PromptReceived = 'PromptReceived',
  TokensEstimated = 'TokensEstimated',
  BudgetAllocated = 'BudgetAllocated',
  AllocationOptimized = 'AllocationOptimized',
  CompletionPredicted = 'CompletionPredicted',
  BudgetValidated = 'BudgetValidated',
  OverflowDetected = 'OverflowDetected'
}

export interface BudgetEvent {
  type: BudgetEventType;
  timestamp: number;
  payload?: any;
}

export type BudgetEventListener = (event: BudgetEvent) => void;
