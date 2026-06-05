import { SimilarityMetric } from './vectorStoreTypes';

export function calculateCosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function calculateDotProduct(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
  }
  return dotProduct;
}

export function calculateEuclideanDistance(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) return 0;
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    const diff = v1[i] - v2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Calculates similarity score matching the requested metric.
 */
export function calculateSimilarity(v1: number[], v2: number[], metric: SimilarityMetric): number {
  switch (metric) {
    case SimilarityMetric.Cosine:
      return calculateCosineSimilarity(v1, v2);
    case SimilarityMetric.DotProduct:
      return calculateDotProduct(v1, v2);
    case SimilarityMetric.Euclidean:
      const dist = calculateEuclideanDistance(v1, v2);
      return 1 / (1 + dist);
    default:
      return 0;
  }
}
