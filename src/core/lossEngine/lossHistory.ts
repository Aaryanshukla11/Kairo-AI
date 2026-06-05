export interface LossHistoryEntry {
  timestamp: number;
  timeStr: string;
  sessionId: string;
  action: string;
}

export class LossHistory {
  private history: LossHistoryEntry[] = [];

  public logAction(sessionId: string, action: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    this.history.push({
      timestamp: Date.now(),
      timeStr,
      sessionId,
      action
    });

    if (this.history.length > 200) {
      this.history.shift();
    }
  }

  public getHistory(): LossHistoryEntry[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const lossHistory = new LossHistory();
export default lossHistory;
