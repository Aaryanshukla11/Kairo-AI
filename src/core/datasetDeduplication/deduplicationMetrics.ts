export class DeduplicationMetrics {
  private totalInputCount = 0;
  private totalDuplicatesCount = 0;
  private totalSpaceSavedBytes = 0;

  public logDeduplicationRun(inputCount: number, duplicatesCount: number, spaceSaved: number): void {
    this.totalInputCount += inputCount;
    this.totalDuplicatesCount += duplicatesCount;
    this.totalSpaceSavedBytes += spaceSaved;
  }

  public getSummary() {
    return {
      totalInputSamples: this.totalInputCount,
      totalDuplicatesFound: this.totalDuplicatesCount,
      totalSpaceSavedBytes: this.totalSpaceSavedBytes
    };
  }

  public clear(): void {
    this.totalInputCount = 0;
    this.totalDuplicatesCount = 0;
    this.totalSpaceSavedBytes = 0;
  }
}

export const deduplicationMetrics = new DeduplicationMetrics();
export default deduplicationMetrics;
