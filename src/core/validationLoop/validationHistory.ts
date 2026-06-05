import { ValidationReportModel } from './validationTypes';

export interface ValidationHistoryEntry {
  timestamp: number;
  timeStr: string;
  sessionId: string;
  action: string;
  report?: ValidationReportModel;
}

export class ValidationHistory {
  private history: ValidationHistoryEntry[] = [];

  public logAction(sessionId: string, action: string, report?: ValidationReportModel): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    this.history.push({
      timestamp: Date.now(),
      timeStr,
      sessionId,
      action,
      report
    });

    if (this.history.length > 500) {
      this.history.shift();
    }
  }

  public getHistory(sessionId?: string): ValidationHistoryEntry[] {
    if (sessionId) {
      return this.history.filter(h => h.sessionId === sessionId);
    }
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const validationHistory = new ValidationHistory();
export default validationHistory;
