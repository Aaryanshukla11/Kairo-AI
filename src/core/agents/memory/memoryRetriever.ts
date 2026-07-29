import { Memory, MemoryFilter } from './memoryTypes';
import { MemoryIndex } from './memoryIndex';
import { memoryScorer } from './memoryScorer';

export class MemoryRetriever {
  public retrieve(
    memories: Memory[],
    index: MemoryIndex,
    filter: MemoryFilter
  ): Memory[] {
    let candidates = new Set<string>(memories.map(m => m.id));

    if (filter.type) {
      const typeIds = index.getIdsByType(filter.type);
      candidates = new Set(Array.from(candidates).filter(id => typeIds.has(id)));
    }

    if (filter.tags && filter.tags.length > 0) {
      for (const tag of filter.tags) {
        const tagIds = index.getIdsByTag(tag);
        candidates = new Set(Array.from(candidates).filter(id => tagIds.has(id)));
      }
    }

    let filteredMemories = memories.filter(m => candidates.has(m.id));

    if (filter.importanceMin !== undefined) {
      filteredMemories = filteredMemories.filter(m => m.importance >= filter.importanceMin!);
    }

    const query = filter.query?.toLowerCase().trim() || '';
    const queryTerms = query ? query.split(/\s+/).filter(t => t.length > 0) : [];

    const scored = filteredMemories.map(m => {
      const score = memoryScorer.score(m, queryTerms);
      return {
        memory: m,
        score
      };
    });

    let results = scored;
    if (queryTerms.length > 0) {
      results = scored.filter(r => r.score > 0.1);
    }

    results.sort((a, b) => b.score - a.score);

    return results.map(r => ({
      ...r.memory,
      relevanceScore: parseFloat(r.score.toFixed(2))
    }));
  }
}
