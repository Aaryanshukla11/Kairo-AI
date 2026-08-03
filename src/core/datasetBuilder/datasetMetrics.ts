export class DatasetMetricsTracker {
  private totalBuilt = 0;

  public logBuild(): void {
    this.totalBuilt++;
  }

  public getStats() {
    return {
      totalDatasetsBuilt: this.totalBuilt
    };
  }

  public clear(): void {
    this.totalBuilt = 0;
  }
}

export const datasetMetricsTracker = new DatasetMetricsTracker();
