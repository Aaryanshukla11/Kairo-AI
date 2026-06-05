export interface NamingMetricsData {
  totalNamesGenerated: number;
  totalCollisionsAvoided: number;
}

export class NamingMetrics {
  private data: NamingMetricsData = {
    totalNamesGenerated: 0,
    totalCollisionsAvoided: 0
  };

  public record(collisionAvoided: boolean): void {
    this.data.totalNamesGenerated++;
    if (collisionAvoided) {
      this.data.totalCollisionsAvoided++;
    }
  }

  public getMetrics(): NamingMetricsData {
    return this.data;
  }
}

export const namingMetrics = new NamingMetrics();
