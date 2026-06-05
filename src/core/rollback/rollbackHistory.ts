import { RollbackInfo } from './rollbackTypes';

export class RollbackHistory {
  private history: RollbackInfo[] = [];

  /**
   * Logs a completed or failed rollback status change.
   */
  public log(rollback: RollbackInfo): void {
    this.history.push({ ...rollback });
  }

  /**
   * Returns copy of the logged rollback histories.
   */
  public getLog(): RollbackInfo[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const rollbackHistory = new RollbackHistory();
