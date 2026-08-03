import { ContextItem } from './contextTypes';

export class ContextRanker {
  public rank(items: ContextItem[], query: string): ContextItem[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const ranked = items.map(item => {
      let matches = 0;
      const contentLower = item.content.toLowerCase();
      
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          matches++;
        }
      }

      // Compute relevance score [0.0, 1.0]
      const score = queryWords.length > 0 ? matches / queryWords.length : 0.5;
      return {
        ...item,
        score: parseFloat(score.toFixed(2))
      };
    });

    // Sort by score descending, preserving stable ordering for ties
    return ranked.sort((a, b) => b.score - a.score);
  }
}

export const contextRanker = new ContextRanker();
