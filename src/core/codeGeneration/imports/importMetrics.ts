export interface ImportMetricsData {
  totalResolutions: number;
  totalUnusedImported: number;
}

export class ImportMetrics {
  private data: ImportMetricsData = {
    totalResolutions: 0,
    totalUnusedImported: 0
  };

  public record(unusedCount: number): void {
    this.data.totalResolutions++;
    this.data.totalUnusedImported += unusedCount;
  }

  public getMetrics(): ImportMetricsData {
    return this.data;
  }
}

export const importMetrics = new ImportMetrics();
