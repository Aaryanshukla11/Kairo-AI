export interface ExecutionMetricsData {
  runsExecutedCount: number;
  totalExecutionTimeMs: number;
  toolsInvokedCount: number;
  avgSuccessRate: number;
}

export class ExecutionMetrics {
  private data: ExecutionMetricsData = {
    runsExecutedCount: 0,
    totalExecutionTimeMs: 0,
    toolsInvokedCount: 0,
    avgSuccessRate: 100
  };

  public recordExecutionRun(latencyMs: number, toolCalls: number, success: boolean): void {
    const successFactor = success ? 100 : 0;
    const totalSuccess = (this.data.avgSuccessRate * this.data.runsExecutedCount) + successFactor;
    this.data.runsExecutedCount++;
    this.data.totalExecutionTimeMs += latencyMs;
    this.data.toolsInvokedCount += toolCalls;
    this.data.avgSuccessRate = totalSuccess / this.data.runsExecutedCount;
  }

  public getMetrics(): ExecutionMetricsData {
    return this.data;
  }
}

export const executionMetrics = new ExecutionMetrics();
