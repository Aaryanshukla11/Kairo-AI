export interface TaskResourceEstimation {
  taskId: string;
  cpuPercent: number;
  memoryMB: number;
  diskMB: number;
  llmContextTokens: number;
  tokenBudget: number;
  estimatedRuntimeMs: number;
  parallelWorkers: number;
}
