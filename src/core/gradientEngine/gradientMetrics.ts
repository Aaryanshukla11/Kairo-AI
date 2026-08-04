export class GradientMetrics {
  private totalClipped = 0;
  private totalAnomalies = 0;

  public logClipping(): void {
    this.totalClipped++;
  }

  public logAnomaly(): void {
    this.totalAnomalies++;
  }

  public getSummary() {
    return {
      totalClippedEvents: this.totalClipped,
      totalAnomaliesDetected: this.totalAnomalies
    };
  }

  public clear(): void {
    this.totalClipped = 0;
    this.totalAnomalies = 0;
  }
}

export const gradientMetrics = new GradientMetrics();
export default gradientMetrics;
