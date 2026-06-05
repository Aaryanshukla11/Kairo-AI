import { TokenAllocationMap, OverflowStrategy } from './budgetTypes';

export class OverflowManager {
  public handleOverflow(
    allocations: TokenAllocationMap,
    excessTokens: number,
    strategy: OverflowStrategy
  ): { allocations: TokenAllocationMap; applied: boolean } {
    if (excessTokens <= 0) {
      return { allocations, applied: false };
    }

    const modified = { ...allocations };
    
    switch (strategy) {
      case OverflowStrategy.PriorityTrimming:
        // Trim low-priority fields first
        modified.diagnostics = Math.max(0, modified.diagnostics - Math.floor(excessTokens * 0.2));
        modified.toolResults = Math.max(0, modified.toolResults - Math.floor(excessTokens * 0.2));
        modified.memory = Math.max(0, modified.memory - Math.floor(excessTokens * 0.3));
        modified.retrievedContext = Math.max(0, modified.retrievedContext - Math.floor(excessTokens * 0.3));
        break;

      case OverflowStrategy.Compression:
      default:
        // Uniform compression factor
        const total = modified.workspaceContext + modified.conversation;
        if (total > 0) {
          const factor = (total - excessTokens) / total;
          modified.workspaceContext = Math.max(0, Math.floor(modified.workspaceContext * factor));
          modified.conversation = Math.max(0, Math.floor(modified.conversation * factor));
        }
        break;
    }

    return {
      allocations: modified,
      applied: true
    };
  }
}

export const overflowManager = new OverflowManager();
