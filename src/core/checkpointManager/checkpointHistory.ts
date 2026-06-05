export interface CheckpointHistoryEntry {
  timestamp: number;
  timeStr: string;
  checkpointId: string;
  action: string;
}

export class CheckpointHistory {
  private history: CheckpointHistoryEntry[] = [];

  public logAction(checkpointId: string, action: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    this.history.push({
      timestamp: Date.now(),
      timeStr,
      checkpointId,
      action
    });

    if (this.history.length > 200) {
      this.history.shift();
    }
  }

  public getHistory(): CheckpointHistoryEntry[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const checkpointHistory = new CheckpointHistory();
export default checkpointHistory;
