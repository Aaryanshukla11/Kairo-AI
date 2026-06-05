import { RecoveryReport } from './recoveryTypes';

export class RecoveryHistoryManager {
  private history: RecoveryReport[] = [];

  record(report: RecoveryReport): void {
    this.history.push(report);
  }

  getHistory(): RecoveryReport[] {
    return [...this.history];
  }

  clear(): void {
    this.history = [];
  }
}

export const recoveryHistoryManager = new RecoveryHistoryManager();
