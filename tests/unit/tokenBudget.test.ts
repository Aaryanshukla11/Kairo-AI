import * as assert from 'assert';
import { tokenBudgetManager } from '../../src/core/tokenBudget/tokenBudgetManager';
import { tokenCounter } from '../../src/core/tokenBudget/tokenCounter';
import { overflowManager } from '../../src/core/tokenBudget/overflowManager';
import { contextAllocator } from '../../src/core/tokenBudget/contextAllocator';
import { TokenAllocationMap, OverflowStrategy } from '../../src/core/tokenBudget/budgetTypes';

describe('Token Budget Manager Tests', () => {
  describe('Token Counting', () => {
    it('should approximate character counts into tokens', () => {
      const text = 'This is a sample prompt for testing token counts.';
      const tokens = tokenCounter.count(text);
      assert.strictEqual(tokens, 13); // Math.ceil(49 / 4)
    });
  });

  describe('Allocation & Adaptability', () => {
    it('should allocate budgets correctly based on limits', () => {
      const allocations = contextAllocator.allocate(8192, 1000, 500);
      assert.strictEqual(allocations.expectedCompletion, 1000);
      assert.strictEqual(allocations.reservedMargin, 500);
      
      const totalAvailable = 8192 - 1000 - 500;
      assert.strictEqual(allocations.workspaceContext, Math.floor(totalAvailable * 0.30));
    });
  });

  describe('Overflow Trimming', () => {
    it('should apply priority trimming strategy to reduce allocations', () => {
      const initial: TokenAllocationMap = {
        systemPrompt: 100,
        developerPrompt: 100,
        userPrompt: 100,
        workspaceContext: 1000,
        memory: 200,
        conversation: 500,
        retrievedContext: 500,
        diagnostics: 200,
        toolResults: 100,
        expectedCompletion: 1000,
        reservedMargin: 500
      };

      const excess = 400;
      const { allocations } = overflowManager.handleOverflow(initial, excess, OverflowStrategy.PriorityTrimming);
      
      assert.ok(allocations.diagnostics < initial.diagnostics);
      assert.ok(allocations.memory < initial.memory);
    });
  });

  describe('Budget Pipeline Process', () => {
    it('should compile budget reports successfully', async () => {
      const report = await tokenBudgetManager.getBudgetReport('Calculate quick sort algorithm', 8192, 'code');
      assert.strictEqual(report.totalBudget, 8192);
      assert.strictEqual(report.isOverflow, false);
      assert.ok(report.allocations.workspaceContext > 0);
    });
  });
});
