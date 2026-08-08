export class ReleaseMetrics {
  private activeBuildsCount = 0;
  private successfulReleasesCount = 0;
  private failedQualityGatesCount = 0;

  public incrementBuilds(): void {
    this.activeBuildsCount++;
  }

  public incrementSuccesses(): void {
    this.successfulReleasesCount++;
  }

  public incrementFailures(): void {
    this.failedQualityGatesCount++;
  }

  public getSummary(): {
    activeBuilds: number;
    successfulReleases: number;
    failedQualityGates: number;
  } {
    return {
      activeBuilds: this.activeBuildsCount,
      successfulReleases: this.successfulReleasesCount,
      failedQualityGates: this.failedQualityGatesCount
    };
  }

  public clear(): void {
    this.activeBuildsCount = 0;
    this.successfulReleasesCount = 0;
    this.failedQualityGatesCount = 0;
  }
}

export const releaseMetrics = new ReleaseMetrics();
