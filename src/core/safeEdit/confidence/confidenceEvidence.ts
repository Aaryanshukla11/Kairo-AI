import { SafeEditInput } from '../safeEditTypes';
import { ConfidenceEvidence } from './confidenceTypes';

export class ConfidenceEvidenceCollector {
  public collect(input: SafeEditInput): ConfidenceEvidence[] {
    const list: ConfidenceEvidence[] = [];

    // Factor 1: Known Files
    const isKnownFile = input.targetFile.startsWith('src/');
    list.push({
      factor: 'Known Files',
      score: isKnownFile ? 1.0 : 0.6,
      description: isKnownFile ? 'Target file is inside the standard src/ directory.' : 'Target file is outside standard directory bounds.'
    });

    // Factor 2: Validation Score
    const valScore = input.validationReport ? input.validationReport.validationScore / 100 : 0.85;
    list.push({
      factor: 'Validation Score',
      score: valScore,
      description: `Validation score alignment coefficient: ${valScore}`
    });

    return list;
  }
}
export const confidenceEvidenceCollector = new ConfidenceEvidenceCollector();
