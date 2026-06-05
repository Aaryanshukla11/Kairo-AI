import * as assert from 'assert';
import { contextWindowManager } from '../../src/core/contextWindow/contextWindowManager';
import { contextDeduplicator } from '../../src/core/contextWindow/contextDeduplicator';
import { contextCompressor } from '../../src/core/contextWindow/contextCompressor';
import { contextSelector } from '../../src/core/contextWindow/contextSelector';
import { contextRanker } from '../../src/core/contextWindow/contextRanker';
import { ContextPriority, ContextItem } from '../../src/core/contextWindow/contextTypes';

describe('Context Window Manager Tests', () => {
  describe('Deduplication', () => {
    it('should remove items with duplicate contents or IDs', () => {
      const items: ContextItem[] = [
        { id: '1', source: 'workspace', content: 'function add() {}', tokenCount: 5, priority: ContextPriority.Medium, score: 0.5 },
        { id: '1', source: 'workspace', content: 'different content', tokenCount: 5, priority: ContextPriority.Medium, score: 0.5 },
        { id: '2', source: 'workspace', content: 'function add() {}', tokenCount: 5, priority: ContextPriority.Medium, score: 0.5 }
      ];

      const deduplicated = contextDeduplicator.deduplicate(items);
      assert.strictEqual(deduplicated.length, 1);
      assert.strictEqual(deduplicated[0].id, '1');
    });
  });

  describe('Compression', () => {
    it('should strip comments and blank spaces during compression', () => {
      const item: ContextItem = {
        id: 'c1',
        source: 'workspace',
        content: `
          // This is a comment
          const x = 10;
          
          /* Block comment */
          console.log(x);
        `,
        tokenCount: 40,
        priority: ContextPriority.Medium,
        score: 0.5
      };

      const { item: compressed } = contextCompressor.compressItem(item);
      assert.ok(!compressed.content.includes('comment'));
      assert.ok(compressed.tokenCount < item.tokenCount);
    });
  });

  describe('Ranking', () => {
    it('should rank items based on lexical keyword overlaps', () => {
      const items: ContextItem[] = [
        { id: 'r1', source: 'workspace', content: 'calculating binary search in array list', tokenCount: 10, priority: ContextPriority.Medium, score: 0.5 },
        { id: 'r2', source: 'workspace', content: 'quick sort partition algorithms logic', tokenCount: 10, priority: ContextPriority.Medium, score: 0.5 }
      ];

      const ranked = contextRanker.rank(items, 'binary search array');
      assert.strictEqual(ranked[0].id, 'r1');
      assert.ok(ranked[0].score > ranked[1].score);
    });
  });

  describe('Selection & Allocation', () => {
    it('should prioritize and truncate to respect strict budget limits', () => {
      const items: ContextItem[] = [
        { id: 's1', source: 'system', content: 'Critical System Instructions', tokenCount: 300, priority: ContextPriority.Critical, score: 1.0 },
        { id: 's2', source: 'workspace', content: 'High Relevance Code snippet', tokenCount: 400, priority: ContextPriority.High, score: 0.8 },
        { id: 's3', source: 'memory', content: 'Low relevance background memory log description', tokenCount: 200, priority: ContextPriority.Low, score: 0.2 }
      ];

      // Limit of 500 tokens should fit Critical, then partial or drop other items
      const selected = contextSelector.selectBudget(items, 500);
      const totalAllocated = selected.reduce((sum, i) => sum + i.tokenCount, 0);
      assert.ok(totalAllocated <= 500);
      assert.ok(selected.some(i => i.id === 's1'));
    });
  });
});
