export class TokenizerMetrics {
  private trainedCount = 0;
  private timelineLogs: Array<{ timestamp: number; timeStr: string; event: string }> = [];

  public logTraining(algorithm: string, datasetId: string, version: string): void {
    this.trainedCount++;
    this.addLog(`Trained ${algorithm} tokenizer on dataset version ${datasetId}:${version}`);
  }

  public addLog(event: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    this.timelineLogs.push({
      timestamp: Date.now(),
      timeStr,
      event
    });

    if (this.timelineLogs.length > 100) {
      this.timelineLogs.shift();
    }
  }

  public getHistoryLogs() {
    return [...this.timelineLogs];
  }

  public getStats() {
    return {
      totalTokenizersTrained: this.trainedCount
    };
  }

  public clear(): void {
    this.trainedCount = 0;
    this.timelineLogs = [];
  }
}

export const tokenizerMetrics = new TokenizerMetrics();
export default tokenizerMetrics;
