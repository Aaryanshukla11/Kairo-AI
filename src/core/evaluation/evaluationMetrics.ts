export class EvaluationMetrics {
  private timelineLogs: Array<{ timestamp: number; timeStr: string; event: string }> = [];

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

  public clear(): void {
    this.timelineLogs = [];
  }
}

export const evaluationMetrics = new EvaluationMetrics();
export default evaluationMetrics;
