export interface ExperimentHistoryEntry {
  timestamp: number;
  timeStr: string;
  experimentId: string;
  action: string;
}

export class ExperimentHistory {
  private history: ExperimentHistoryEntry[] = [];

  public logAction(experimentId: string, action: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    this.history.push({
      timestamp: Date.now(),
      timeStr,
      experimentId,
      action
    });

    if (this.history.length > 200) {
      this.history.shift();
    }
  }

  public getHistory(): ExperimentHistoryEntry[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const experimentHistory = new ExperimentHistory();
export default experimentHistory;
