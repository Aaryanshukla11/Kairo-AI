import { TokenBudgetReport, TokenAllocationMap, BudgetEventType, OverflowStrategy } from './budgetTypes';
import { budgetEstimator } from './budgetEstimator';
import { budgetAllocator } from './budgetAllocator';
import { budgetOptimizer } from './budgetOptimizer';
import { tokenPredictor } from './tokenPredictor';
import { budgetValidator } from './budgetValidator';
import { overflowManager } from './overflowManager';
import { budgetEvents } from './budgetEvents';
import { budgetHistory } from './budgetHistory';
import { budgetMetrics } from './budgetMetrics';

export class BudgetEngine {
  public async process(
    promptText: string,
    limit: number,
    taskType: string,
    margin = 500
  ): Promise<TokenBudgetReport> {
    budgetEvents.emit(BudgetEventType.PromptReceived);

    // Estimate
    const promptTokens = budgetEstimator.estimate(promptText);
    budgetEvents.emit(BudgetEventType.TokensEstimated, { promptTokens });

    // Predict completion
    const completionTokens = tokenPredictor.predictCompletion(promptText, taskType);
    budgetEvents.emit(BudgetEventType.CompletionPredicted, { completionTokens });

    // Allocate
    let allocations = budgetAllocator.allocate(limit, completionTokens, margin);
    budgetEvents.emit(BudgetEventType.BudgetAllocated);

    // Optimize
    allocations = budgetOptimizer.optimize(allocations);
    budgetEvents.emit(BudgetEventType.AllocationOptimized);

    // Detect overflow
    const totalAllocated = promptTokens + completionTokens + margin;
    const isOverflow = totalAllocated > limit;
    const excess = totalAllocated - limit;
    const warnings: string[] = [];

    if (isOverflow) {
      budgetEvents.emit(BudgetEventType.OverflowDetected, { excess });
      warnings.push(`Allocation overflow of ${excess} tokens detected.`);
      const result = overflowManager.handleOverflow(allocations, excess, OverflowStrategy.PriorityTrimming);
      allocations = result.allocations;
    }

    const report: TokenBudgetReport = {
      reportId: `BUD-REP-${Date.now()}`,
      timestamp: Date.now(),
      totalBudget: limit,
      allocated: totalAllocated,
      remaining: Math.max(0, limit - totalAllocated),
      expectedCompletion: completionTokens,
      safetyMargin: margin,
      allocations,
      isOverflow,
      warnings
    };

    // Validate
    try {
      budgetValidator.validate(report);
    } catch (err: any) {
      warnings.push(`Validation Warning: ${err.message}`);
    }
    budgetEvents.emit(BudgetEventType.BudgetValidated);

    budgetHistory.logReport(report);
    budgetMetrics.logReport(report);

    return report;
  }
}

export const budgetEngine = new BudgetEngine();
