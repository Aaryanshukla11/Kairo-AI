import { Fingerprint, DeduplicationConfig } from './deduplicationTypes';
import { exactMatchDetector } from './exactMatchDetector';
import { structuralSimilarity } from './structuralSimilarity';
import { semanticSimilarity } from './semanticSimilarity';

export interface SimilarityResult {
  isDuplicate: boolean;
  matchType: 'exact' | 'structural' | 'semantic' | 'none';
  similarityScore: number;
}

export class SimilarityEngine {
  public evaluateSimilarity(
    f1: Fingerprint,
    f2: Fingerprint,
    config: DeduplicationConfig
  ): SimilarityResult {
    // 1. Exact matching
    if (exactMatchDetector.isExactMatch(f1, f2)) {
      return {
        isDuplicate: true,
        matchType: 'exact',
        similarityScore: 1.0
      };
    }

    // 2. Structural matching
    const structScore = structuralSimilarity.computeStructuralSimilarity(f1, f2);
    if (structScore >= config.structuralThreshold) {
      return {
        isDuplicate: true,
        matchType: 'structural',
        similarityScore: structScore
      };
    }

    // 3. Semantic matching (MinHash sliding shingles Jaccard approximation)
    const semanticScore = semanticSimilarity.computeSemanticSimilarity(f1, f2);
    if (semanticScore >= config.semanticThreshold) {
      return {
        isDuplicate: true,
        matchType: 'semantic',
        similarityScore: semanticScore
      };
    }

    return {
      isDuplicate: false,
      matchType: 'none',
      similarityScore: Math.max(structScore, semanticScore)
    };
  }
}

export const similarityEngine = new SimilarityEngine();
export default similarityEngine;
