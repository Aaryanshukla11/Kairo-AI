export class ReviewStrategies {
  /**
   * Builds custom list of recommendations depending on plan strategy.
   */
  public generateRecommendations(strategy: string): string[] {
    const recs: string[] = [];
    if (strategy === 'BugFix') {
      recs.push('Verify fix with regression specs.');
      recs.push('Inspect imports to avoid cycles.');
    } else if (strategy === 'Refactoring') {
      recs.push('Split massive changes into non-breaking chunks.');
      recs.push('Verify that public API remains backward compatible.');
    } else {
      recs.push('Enforce modular component structures.');
      recs.push('Verify parameters validation before starting executions.');
    }
    return recs;
  }
}

export const reviewStrategies = new ReviewStrategies();
