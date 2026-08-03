import { TokenBudgetReport } from './budgetTypes';

export class BudgetCache {
  private cache = new Map<string, TokenBudgetReport>();

  public get(key: string): TokenBudgetReport | undefined {
    return this.cache.get(key);
  }

  public set(key: string, report: TokenBudgetReport): void {
    this.cache.set(key, report);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const budgetCache = new BudgetCache();
