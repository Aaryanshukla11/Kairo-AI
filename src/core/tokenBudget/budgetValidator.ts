import { TokenBudgetReport } from './budgetTypes';

export class BudgetValidator {
  public validate(report: TokenBudgetReport): void {
    if (report.isOverflow) {
      throw new Error(`Token budget validation error: Allocated token budget of ${report.allocated} exceeds model limit of ${report.totalBudget} tokens.`);
    }

    if (report.safetyMargin < 100) {
      throw new Error(`Token budget validation error: Safety margin of ${report.safetyMargin} tokens is below minimum threshold of 100 tokens.`);
    }
  }
}

export const budgetValidator = new BudgetValidator();
