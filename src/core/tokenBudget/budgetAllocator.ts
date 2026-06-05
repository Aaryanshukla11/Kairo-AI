import { contextAllocator } from './contextAllocator';
import { TokenAllocationMap } from './budgetTypes';

export class BudgetAllocator {
  public allocate(limit: number, expectedCompletion: number, margin: number): TokenAllocationMap {
    return contextAllocator.allocate(limit, expectedCompletion, margin);
  }
}

export const budgetAllocator = new BudgetAllocator();
