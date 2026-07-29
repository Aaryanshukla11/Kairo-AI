export interface MultiFileMetricsData {
  tasksPlanned: number;
  totalFilesAffected: number;
}

export class MultiFileMetrics {
  private data: MultiFileMetricsData = {
    tasksPlanned: 0,
    totalFilesAffected: 0
  };

  public record(filesCount: number): void {
    this.data.tasksPlanned++;
    this.data.totalFilesAffected += filesCount;
  }

  public getMetrics(): MultiFileMetricsData {
    return this.data;
  }
}

export const multiFileMetrics = new MultiFileMetrics();
