import { TokenAllocationMap } from './budgetTypes';

export class ContextAllocator {
  public allocate(
    limit: number,
    expectedCompletion: number,
    margin: number
  ): TokenAllocationMap {
    const available = limit - expectedCompletion - margin;

    // Distribute allocationsAdaptively based on priority ratios
    return {
      systemPrompt: Math.floor(available * 0.15),
      developerPrompt: Math.floor(available * 0.10),
      userPrompt: Math.floor(available * 0.15),
      workspaceContext: Math.floor(available * 0.30),
      memory: Math.floor(available * 0.05),
      conversation: Math.floor(available * 0.10),
      retrievedContext: Math.floor(available * 0.10),
      diagnostics: Math.floor(available * 0.03),
      toolResults: Math.floor(available * 0.02),
      expectedCompletion,
      reservedMargin: margin
    };
  }
}

export const contextAllocator = new ContextAllocator();
