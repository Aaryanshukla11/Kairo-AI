import { ContextItem, ContextReport, TokenAllocation, ContextEventType } from './contextTypes';
import { contextRanker } from './contextRanker';
import { contextDeduplicator } from './contextDeduplicator';
import { contextCompressor } from './contextCompressor';
import { contextSelector } from './contextSelector';
import { contextAssembler } from './contextAssembler';
import { contextValidator } from './contextValidator';
import { contextCache } from './contextCache';
import { contextMetricsTracker } from './contextMetrics';
import { contextEvents } from './contextEvents';
import { contextHistory } from './contextHistory';

export class ContextWindowManager {
  public async compileContext(
    rawItems: ContextItem[],
    tokenLimit: number,
    query: string
  ): Promise<{ compiledText: string; report: ContextReport }> {
    contextEvents.emit(ContextEventType.ContextCollected, { count: rawItems.length });

    // Deduplicate
    const unique = contextDeduplicator.deduplicate(rawItems);
    
    // Rank
    const ranked = contextRanker.rank(unique, query);
    contextEvents.emit(ContextEventType.ContextRanked, { count: ranked.length });

    // Compress
    const { items: compressed, report: compReport } = contextCompressor.compressList(ranked);
    contextEvents.emit(ContextEventType.ContextCompressed, { ratio: compReport.ratio });

    // Select based on token allocation budgets
    const selected = contextSelector.selectBudget(compressed, tokenLimit);
    
    // Assemble
    const compiledText = contextAssembler.assemble(selected);
    contextEvents.emit(ContextEventType.ContextAssembled, { length: compiledText.length });

    // Validate
    contextValidator.validate(selected, tokenLimit);
    contextEvents.emit(ContextEventType.ContextValidated);

    // Compute Metrics & Reports
    const allocation = contextMetricsTracker.compileAllocation(selected, tokenLimit);
    const priorities = contextMetricsTracker.compilePriorityReport(selected);

    const report: ContextReport = {
      reportId: `CTX-REP-${Date.now()}`,
      timestamp: Date.now(),
      totalTokens: tokenLimit - allocation.available,
      allocation,
      compression: compReport,
      priorities,
      cacheHit: false
    };

    contextHistory.logReport(report);
    
    return {
      compiledText,
      report
    };
  }
}

export const contextWindowManager = new ContextWindowManager();
