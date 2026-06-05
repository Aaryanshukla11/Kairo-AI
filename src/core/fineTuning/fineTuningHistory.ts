import { FineTuningReport } from './fineTuningTypes';

export interface FineTuningHistoryEntry {
  timestamp: number;
  action: string;
  report?: FineTuningReport;
}

export class FineTuningHistory {
  private history: Map<string, FineTuningHistoryEntry[]> = new Map();

  public logAction(sessionId: string, action: string, report?: FineTuningReport): void {
    let list = this.history.get(sessionId);
    if (!list) {
      list = [];
      this.history.set(sessionId, list);
    }
    list.push({
      timestamp: Date.now(),
      action,
      report
    });
  }

  public getHistory(sessionId?: string): FineTuningHistoryEntry[] {
    if (sessionId) {
      return this.history.get(sessionId) || [];
    }
    const all: FineTuningHistoryEntry[] = [];
    for (const list of this.history.values()) {
      all.push(...list);
    }
    return all.sort((a, b) => a.timestamp - b.timestamp);
  }

  public clear(): void {
    this.history.clear();
  }
}

export const fineTuningHistory = new FineTuningHistory();
export default fineTuningHistory;
