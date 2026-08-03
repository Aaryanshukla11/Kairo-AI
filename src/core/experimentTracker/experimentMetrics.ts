export class ExperimentMetrics {
  private totalCount = 0;

  public logRun(): void {
    this.totalCount++;
  }

  public getSummary() {
    return {
      totalExperimentsRecorded: this.totalCount
    };
  }

  public clear(): void {
    this.totalCount = 0;
  }
}

export const experimentMetrics = new ExperimentMetrics();
export default experimentMetrics;
