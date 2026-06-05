import { StoppingReportModel } from './stoppingTypes';

export interface StoppingHistoryEntry {
  timestamp: number;
  action: string;
  report?: StoppingReportModel;
}

export class StoppingHistory {
  private history: Map<string, StoppingHistoryEntry[]> = new Map();

  public logAction(sessionId: string, action: string, report?: StoppingReportModel): void {
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

  public getHistory(sessionId?: string): StoppingHistoryEntry[] {
    if (sessionId) {
      return this.history.get(sessionId) || [];
    }
    const all: StoppingHistoryEntry[] = [];
    for (const list of this.history.values()) {
      all.push(...list);
    }
    return all.sort((a, b) => a.timestamp - b.timestamp);
  }

  public clear(): void {
    this.history.clear();
  }
}

export const stoppingHistory = new StoppingHistory();
export default stoppingHistory;
