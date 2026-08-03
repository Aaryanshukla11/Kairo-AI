import { TokenAllocationMap } from './budgetTypes';

export class BudgetOptimizer {
  public optimize(allocations: TokenAllocationMap): TokenAllocationMap {
    // Basic optimization: if workspace context is large, shift tokens from low priority
    const optimized = { ...allocations };
    if (optimized.workspaceContext > 1000) {
      const shift = 100;
      optimized.workspaceContext += shift;
      optimized.memory = Math.max(0, optimized.memory - Math.floor(shift * 0.5));
      optimized.diagnostics = Math.max(0, optimized.diagnostics - Math.floor(shift * 0.5));
    }
    return optimized;
  }
}

export const budgetOptimizer = new BudgetOptimizer();
