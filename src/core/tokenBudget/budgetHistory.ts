import { TokenBudgetReport } from './budgetTypes';

export class BudgetHistory {
  private history: TokenBudgetReport[] = [];

  public logReport(report: TokenBudgetReport): void {
    this.history.push(report);
  }

  public getHistory(): TokenBudgetReport[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const budgetHistory = new BudgetHistory();
