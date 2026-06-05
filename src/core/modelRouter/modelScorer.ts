export class ModelScorer {
  public calculateScore(
    capabilityScore: number,
    resourceScore: number,
    tps: number
  ): number {
    // Normalise tps score
    const tpsNormalized = Math.min(1.0, tps / 50);
    
    // Weight allocations: 50% capability relevance, 30% resource margin safety, 20% TPS throughput speed
    const score = (capabilityScore * 0.5) + (resourceScore * 0.3) + (tpsNormalized * 0.2);
    return parseFloat(score.toFixed(2));
  }
}

export const modelScorer = new ModelScorer();
