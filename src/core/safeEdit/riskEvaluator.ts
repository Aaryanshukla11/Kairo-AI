import { SafeEditInput } from './safeEditTypes';

export class RiskEvaluator {
  public calculateRisk(input: SafeEditInput): { score: number; level: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical' } {
    let score = 10;
    const patchContent = input.patchContent;

    if (patchContent.includes('package.json')) {
      score += 40;
    }
    if (patchContent.includes('fs.') || patchContent.includes('child_process') || patchContent.includes('eval(')) {
      score += 35;
    }
    if (input.targetFile.includes('src/core/')) {
      score += 15;
    }

    if (input.securityReport) {
      score = Math.max(score, input.securityReport.riskScore);
    }

    if (input.optimizedPatchReport) {
      if (input.optimizedPatchReport.predictedMergeRisk === 'high') {
        score += 20;
      } else if (input.optimizedPatchReport.predictedMergeRisk === 'medium') {
        score += 10;
      }
    }

    const finalScore = Math.min(100, Math.max(0, score));
    let level: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical' = 'Minimal';

    if (finalScore <= 20) {
      level = 'Minimal';
    } else if (finalScore <= 40) {
      level = 'Low';
    } else if (finalScore <= 60) {
      level = 'Medium';
    } else if (finalScore <= 80) {
      level = 'High';
    } else {
      level = 'Critical';
    }

    return { score: finalScore, level };
  }
}

export const riskEvaluator = new RiskEvaluator();
