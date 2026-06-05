import { contextAllocator } from '../contextAllocator';
import { TokenAllocationMap } from '../budgetTypes';

export class AllocationProvider {
  public getAllocation(limit: number, expectedCompletion: number, margin: number): TokenAllocationMap {
    return contextAllocator.allocate(limit, expectedCompletion, margin);
  }
}
