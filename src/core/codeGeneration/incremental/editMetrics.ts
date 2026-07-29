export interface EditMetricsData {
  totalEditsRun: number;
  totalPreservedRatio: number;
}

export class EditMetrics {
  private data: EditMetricsData = {
    totalEditsRun: 0,
    totalPreservedRatio: 0
  };

  public record(ratio: number): void {
    this.data.totalEditsRun++;
    this.data.totalPreservedRatio = (this.data.totalPreservedRatio * (this.data.totalEditsRun - 1) + ratio) / this.data.totalEditsRun;
  }

  public getMetrics(): EditMetricsData {
    return this.data;
  }
}

export const editMetrics = new EditMetrics();
