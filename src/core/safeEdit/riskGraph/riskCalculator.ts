import { SafeEditInput } from '../safeEditTypes';
import { CategoryRisk } from './riskTypes';

export class RiskCalculator {
  public calculateCategoryRisk(category: string, input: SafeEditInput): CategoryRisk {
    let score = 10;
    let evidence = ['Initial base category risk calculation'];
    const content = input.patchContent;

    if (category === 'filesystem') {
      if (content.includes('rm -rf') || content.includes('fs.unlink')) {
        score = 90;
        evidence.push('Contains file deletion command patterns');
      } else if (content.includes('fs.write') || content.includes('fs.promises')) {
        score = 45;
        evidence.push('Contains file writing command patterns');
      }
    } else if (category === 'dependency') {
      if (input.targetFile.endsWith('package.json')) {
        score = 80;
        evidence.push('Target file is package.json');
      }
    } else if (category === 'security') {
      if (input.securityReport) {
        score = input.securityReport.riskScore;
        evidence.push(`Imported from security agent report with score: ${score}`);
      }
    }

    let severity: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical' = 'Minimal';
    if (score <= 20) severity = 'Minimal';
    else if (score <= 40) severity = 'Low';
    else if (score <= 60) severity = 'Medium';
    else if (score <= 80) severity = 'High';
    else severity = 'Critical';

    return {
      score,
      confidence: 0.95,
      severity,
      reason: `Assessed risk score of ${score} for category ${category}`,
      evidence
    };
  }
}
export const riskCalculator = new RiskCalculator();
