export interface DeduplicationHistoryEntry {
  timestamp: number;
  timeStr: string;
  datasetId: string;
  runId: string;
  message: string;
}

export class DuplicateHistory {
  private history: DeduplicationHistoryEntry[] = [];

  public logHistory(datasetId: string, runId: string, message: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    this.history.push({
      timestamp: Date.now(),
      timeStr,
      datasetId,
      runId,
      message
    });

    if (this.history.length > 200) {
      this.history.shift();
    }
  }

  public getHistory(): DeduplicationHistoryEntry[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const duplicateHistory = new DuplicateHistory();
export default duplicateHistory;
