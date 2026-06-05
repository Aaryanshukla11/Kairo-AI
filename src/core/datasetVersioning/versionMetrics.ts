export class VersionMetrics {
  private totalVersionsRegistered = 0;
  private totalDatasetSamples = 0;

  public logRegistration(sampleCount: number): void {
    this.totalVersionsRegistered++;
    this.totalDatasetSamples += sampleCount;
  }

  public getSummary() {
    return {
      totalVersionsRegistered: this.totalVersionsRegistered,
      totalDatasetSamples: this.totalDatasetSamples
    };
  }

  public clear(): void {
    this.totalVersionsRegistered = 0;
    this.totalDatasetSamples = 0;
  }
}

export const versionMetrics = new VersionMetrics();
export default versionMetrics;
