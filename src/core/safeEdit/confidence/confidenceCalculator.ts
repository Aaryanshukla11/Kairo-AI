import { ConfidenceEvidence } from './confidenceTypes';

export class ConfidenceCalculator {
  public calculateOverall(evidence: ConfidenceEvidence[]): number {
    if (!evidence.length) return 0.8;
    const sum = evidence.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((sum / evidence.length) * 100) / 100;
  }
}
export const confidenceCalculator = new ConfidenceCalculator();
