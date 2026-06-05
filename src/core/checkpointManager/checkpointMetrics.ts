export class CheckpointMetrics {
  private totalSaved = 0;
  private totalSize = 0;

  public logSave(isCompressed: boolean): void {
    this.totalSaved++;
    // Mock size calculation: 45MB average, compressed size 15MB average
    this.totalSize += isCompressed ? 15000000 : 45000000;
  }

  public logPrune(isCompressed: boolean): void {
    this.totalSaved = Math.max(0, this.totalSaved - 1);
    this.totalSize = Math.max(0, this.totalSize - (isCompressed ? 15000000 : 45000000));
  }

  public getSummary() {
    return {
      totalCheckpointsSaved: this.totalSaved,
      totalStorageBytes: this.totalSize
    };
  }

  public clear(): void {
    this.totalSaved = 0;
    this.totalSize = 0;
  }
}

export const checkpointMetrics = new CheckpointMetrics();
export default checkpointMetrics;
