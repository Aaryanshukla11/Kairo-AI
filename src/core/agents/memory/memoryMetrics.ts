export interface MemoryMetricsData {
  memoriesCount: number;
  decisionsCount: number;
  executionsCount: number;
  compressionsCount: number;
  searchesCount: number;
  lastSearchLatencyMs: number;
}

export class MemoryMetrics {
  private data: MemoryMetricsData = {
    memoriesCount: 0,
    decisionsCount: 0,
    executionsCount: 0,
    compressionsCount: 0,
    searchesCount: 0,
    lastSearchLatencyMs: 0
  };

  public recordOperation(type: string, details?: any): void {
    if (type === 'create') {
      this.data.memoriesCount++;
      if (details?.type === 'Architecture Decision') {
        this.data.decisionsCount++;
      } else if (details?.type === 'Execution Summary') {
        this.data.executionsCount++;
      }
    } else if (type === 'delete') {
      this.data.memoriesCount = Math.max(0, this.data.memoriesCount - 1);
    } else if (type === 'compress') {
      this.data.compressionsCount++;
    } else if (type === 'search') {
      this.data.searchesCount++;
      if (details?.latencyMs !== undefined) {
        this.data.lastSearchLatencyMs = details.latencyMs;
      }
    }
  }

  public getMetrics(): MemoryMetricsData {
    return this.data;
  }
}

export const memoryMetrics = new MemoryMetrics();
