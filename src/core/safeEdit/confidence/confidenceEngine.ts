import { SafeEditInput } from '../safeEditTypes';
import { ExecutionConfidenceReport } from './confidenceTypes';
import { confidenceEvidenceCollector } from './confidenceEvidence';
import { confidenceCalculator } from './confidenceCalculator';

export class ConfidenceEngine {
  public calculate(input: SafeEditInput): ExecutionConfidenceReport {
    const evidence = confidenceEvidenceCollector.collect(input);
    const overallConfidence = confidenceCalculator.calculateOverall(evidence);

    let grade: ExecutionConfidenceReport['grade'] = 'C';
    if (overallConfidence >= 0.9) grade = 'A';
    else if (overallConfidence >= 0.8) grade = 'B';
    else if (overallConfidence >= 0.7) grade = 'C';
    else if (overallConfidence >= 0.6) grade = 'D';
    else grade = 'F';

    let recommendation = 'Proceed with execution. Stability parameters aligned.';
    if (grade === 'F' || grade === 'D') {
      recommendation = 'Halt. Low execution confidence levels.';
    }

    return {
      overallConfidence,
      evidence,
      grade,
      recommendation
    };
  }
}
export const confidenceEngine = new ConfidenceEngine();
