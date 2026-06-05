import { Memory } from './memoryTypes';

export class MemoryScorer {
  /**
   * Computes a relevance score (0.0 to 1.0) for a memory against search parameters.
   */
  public score(
    memory: Memory,
    queryTerms: string[],
    importanceWeight: number = 0.3,
    recencyWeight: number = 0.2,
    relevanceWeight: number = 0.5
  ): number {
    const normImportance = (memory.importance || 5) / 10;

    const ageMs = Date.now() - (memory.updatedAt || memory.createdAt);
    const dayMs = 24 * 60 * 60 * 1000;
    const ageDays = ageMs / dayMs;
    const normRecency = Math.exp(-ageDays / 10);

    let termMatchCount = 0;
    if (queryTerms.length > 0) {
      const textToSearch = [
        memory.title,
        memory.summary,
        memory.content,
        ...(memory.tags || []),
        ...(memory.relatedFiles || [])
      ].join(' ').toLowerCase();

      for (const term of queryTerms) {
        if (textToSearch.includes(term)) {
          termMatchCount++;
        }
      }
    }
    const normRelevance = queryTerms.length > 0 ? termMatchCount / queryTerms.length : 1.0;

    return (
      normImportance * importanceWeight +
      normRecency * recencyWeight +
      normRelevance * relevanceWeight
    );
  }
}

export const memoryScorer = new MemoryScorer();
