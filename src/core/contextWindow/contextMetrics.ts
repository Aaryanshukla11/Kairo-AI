import { ContextItem, TokenAllocation, PriorityReport, ContextCompressionReport } from './contextTypes';

export class ContextMetricsTracker {
  public compileAllocation(items: ContextItem[], limit: number): TokenAllocation {
    let systemPrompt = 0;
    let userPrompt = 0;
    let workspace = 0;
    let conversation = 0;
    let memory = 0;
    let retrievedContext = 0;
    let diagnostics = 0;
    let toolResults = 0;

    for (const item of items) {
      const tokens = item.tokenCount;
      if (item.source === 'system') systemPrompt += tokens;
      else if (item.source === 'user') userPrompt += tokens;
      else if (item.source === 'workspace') workspace += tokens;
      else if (item.source === 'conversation') conversation += tokens;
      else if (item.source === 'memory') memory += tokens;
      else if (item.source === 'retrieval') retrievedContext += tokens;
      else if (item.source === 'diagnostics') diagnostics += tokens;
      else if (item.source === 'tool') toolResults += tokens;
    }

    const total = systemPrompt + userPrompt + workspace + conversation + memory + retrievedContext + diagnostics + toolResults;

    return {
      systemPrompt,
      userPrompt,
      workspace,
      conversation,
      memory,
      retrievedContext,
      diagnostics,
      toolResults,
      available: Math.max(0, limit - total),
      totalLimit: limit
    };
  }

  public compilePriorityReport(items: ContextItem[]): PriorityReport {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let background = 0;

    for (const item of items) {
      const tokens = item.tokenCount;
      if (item.priority === 'Critical') critical += tokens;
      else if (item.priority === 'High') high += tokens;
      else if (item.priority === 'Medium') medium += tokens;
      else if (item.priority === 'Low') low += tokens;
      else if (item.priority === 'Background') background += tokens;
    }

    return {
      criticalTokens: critical,
      highTokens: high,
      mediumTokens: medium,
      lowTokens: low,
      backgroundTokens: background
    };
  }
}

export const contextMetricsTracker = new ContextMetricsTracker();
