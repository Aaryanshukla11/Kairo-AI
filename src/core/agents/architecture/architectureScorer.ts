import { ArchViolation } from './architectureTypes';

export class ArchitectureScorer {
  public calculateScores(
    violations: ArchViolation[],
    driftCount: number
  ): { score: number; technicalDebtHours: number; scalability: number; maintainability: number } {
    let score = 95;
    let technicalDebtHours = 0;

    for (const v of violations) {
      if (v.severity === 'High') {
        score -= 10;
        technicalDebtHours += 8;
      } else if (v.severity === 'Medium') {
        score -= 5;
        technicalDebtHours += 4;
      } else {
        score -= 2;
        technicalDebtHours += 2;
      }
    }

    score -= driftCount * 4;
    technicalDebtHours += driftCount * 3;

    const finalScore = Math.max(10, score);
    const scalability = Math.max(10, finalScore - 5);
    const maintainability = Math.max(10, finalScore - 8);

    return {
      score: finalScore,
      technicalDebtHours,
      scalability,
      maintainability
    };
  }
}

export const architectureScorer = new ArchitectureScorer();
