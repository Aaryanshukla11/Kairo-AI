import { RiskLevel, SecurityIssue } from './securityTypes';

export class SecurityRiskEngine {
  public calculateOverallRisk(issues: SecurityIssue[]): { score: number; level: RiskLevel } {
    let score = 0;

    for (const issue of issues) {
      if (issue.severity === RiskLevel.Critical) {
        score += 45;
      } else if (issue.severity === RiskLevel.High) {
        score += 25;
      } else if (issue.severity === RiskLevel.Medium) {
        score += 10;
      } else if (issue.severity === RiskLevel.Low) {
        score += 4;
      } else {
        score += 1;
      }
    }

    const finalScore = Math.max(0, Math.min(100, score));
    let level = RiskLevel.Info;

    if (finalScore >= 75) {
      level = RiskLevel.Critical;
    } else if (finalScore >= 45) {
      level = RiskLevel.High;
    } else if (finalScore >= 20) {
      level = RiskLevel.Medium;
    } else if (finalScore >= 5) {
      level = RiskLevel.Low;
    }

    return {
      score: finalScore,
      level
    };
  }
}

export const securityRiskEngine = new SecurityRiskEngine();
