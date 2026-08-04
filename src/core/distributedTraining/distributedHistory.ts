export interface DistributedHistoryEntry {
  timestamp: number;
  timeStr: string;
  clusterId: string;
  action: string;
}

export class DistributedHistory {
  private history: DistributedHistoryEntry[] = [];

  public logAction(clusterId: string, action: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    this.history.push({
      timestamp: Date.now(),
      timeStr,
      clusterId,
      action
    });

    if (this.history.length > 200) {
      this.history.shift();
    }
  }

  public getHistory(): DistributedHistoryEntry[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const distributedHistory = new DistributedHistory();
export default distributedHistory;
