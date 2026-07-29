export class ConventionScorer {
  public calculateConfidence(matchesCount: number, totalCount: number): number {
    if (totalCount === 0) return 1.0;
    return Math.min(1.0, matchesCount / totalCount);
  }
}

export const conventionScorer = new ConventionScorer();
