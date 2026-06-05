import { TokenBudgetReport } from './budgetTypes';

export class BudgetMetrics {
  private totalAllocations = 0;
  private totalOverflows = 0;

  public logReport(report: TokenBudgetReport): void {
    this.totalAllocations++;
    if (report.isOverflow) {
      this.totalOverflows++;
    }
  }

  public getStats() {
    return {
      totalAllocations: this.totalAllocations,
      totalOverflows: this.totalOverflows,
      overflowRate: this.totalAllocations > 0 ? this.totalOverflows / this.totalAllocations : 0.0
    };
  }

  public clear(): void {
    this.totalAllocations = 0;
    this.totalOverflows = 0;
  }
}

export const budgetMetrics = new BudgetMetrics();
