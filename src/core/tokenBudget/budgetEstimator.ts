import { tokenCounter } from './tokenCounter';

export class BudgetEstimator {
  public estimate(text: string): number {
    return tokenCounter.count(text);
  }
}

export const budgetEstimator = new BudgetEstimator();
