export interface CleaningHistoryEntry {
  timestamp: number;
  timeStr: string;
  event: string;
  datasetId: string;
  runId: string;
}

export class CleaningHistory {
  private history: CleaningHistoryEntry[] = [];

  public logEvent(datasetId: string, runId: string, event: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    this.history.push({
      timestamp: Date.now(),
      timeStr,
      event,
      datasetId,
      runId
    });

    if (this.history.length > 200) {
      this.history.shift();
    }
  }

  public getHistory(): CleaningHistoryEntry[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const cleaningHistory = new CleaningHistory();
