import { budgetEngine } from './budgetEngine';
import { budgetHistory } from './budgetHistory';
import { budgetCache } from './budgetCache';
import { budgetEvents } from './budgetEvents';
import { TokenBudgetReport } from './budgetTypes';

export class TokenBudgetManager {
  public async getBudgetReport(
    promptText: string,
    limit: number,
    taskType: string,
    margin = 500
  ): Promise<TokenBudgetReport> {
    const cacheKey = JSON.stringify({ promptText, limit, taskType });
    const cached = budgetCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const report = await budgetEngine.process(promptText, limit, taskType, margin);
    budgetCache.set(cacheKey, report);
    return report;
  }

  public getHistory(): TokenBudgetReport[] {
    return budgetHistory.getHistory();
  }

  public clear(): void {
    budgetCache.clear();
    budgetHistory.clear();
  }

  public subscribe(listener: any): () => void {
    return budgetEvents.subscribe(listener);
  }
}

export const tokenBudgetManager = new TokenBudgetManager();
