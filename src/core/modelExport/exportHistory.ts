import { ExportReport } from './exportTypes';

export interface ExportHistoryEntry {
  timestamp: number;
  action: string;
  report?: ExportReport;
}

export class ExportHistory {
  private history: ExportHistoryEntry[] = [];

  public logAction(action: string, report?: ExportReport): void {
    this.history.push({
      timestamp: Date.now(),
      action,
      report
    });
  }

  public getHistory(): ExportHistoryEntry[] {
    return this.history.sort((a, b) => a.timestamp - b.timestamp);
  }

  public clear(): void {
    this.history = [];
  }
}

export const exportHistory = new ExportHistory();
export default exportHistory;
