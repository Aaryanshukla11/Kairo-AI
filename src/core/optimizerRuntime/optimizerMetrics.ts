export class OptimizerMetrics {
  private totalSteps = 0;
  private totalLrs = 0;

  public logStep(): void {
    this.totalSteps++;
  }

  public logLr(): void {
    this.totalLrs++;
  }

  public getSummary() {
    return {
      totalOptimizerSteps: this.totalSteps,
      totalLrUpdates: this.totalLrs
    };
  }

  public clear(): void {
    this.totalSteps = 0;
    this.totalLrs = 0;
  }
}

export const optimizerMetrics = new OptimizerMetrics();
export default optimizerMetrics;
