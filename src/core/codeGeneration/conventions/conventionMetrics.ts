export interface ConventionMetricsData {
  totalScans: number;
  profilesLearned: number;
}

export class ConventionMetrics {
  private data: ConventionMetricsData = {
    totalScans: 0,
    profilesLearned: 0
  };

  public record(learned: boolean): void {
    this.data.totalScans++;
    if (learned) {
      this.data.profilesLearned++;
    }
  }

  public getMetrics(): ConventionMetricsData {
    return this.data;
  }
}

export const conventionMetrics = new ConventionMetrics();
