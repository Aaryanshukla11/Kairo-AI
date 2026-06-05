import { ViolationIssue } from './reviewRules';
import { RiskLevel } from './reviewerTypes';

export class ReviewScorer {
  /**
   * Computes risk, security, maintainability, and overall health scores based on active violations list.
   */
  public calculateScores(issues: ViolationIssue[]): {
    overallScore: number;
    riskScore: number;
    maintainabilityScore: number;
    performanceScore: number;
    securityScore: number;
    riskLevel: RiskLevel;
  } {
    let riskScore = 10;
    let maintainabilityScore = 95;
    let securityScore = 98;
    const performanceScore = 90;

    for (const issue of issues) {
      if (issue.severity === 'low') {
        riskScore += 5;
        maintainabilityScore -= 3;
      } else if (issue.severity === 'medium') {
        riskScore += 15;
        maintainabilityScore -= 8;
      } else if (issue.severity === 'high') {
        riskScore += 30;
        maintainabilityScore -= 15;
        securityScore -= 10;
      } else if (issue.severity === 'critical') {
        riskScore += 50;
        maintainabilityScore -= 30;
        securityScore -= 25;
      }
    }

    riskScore = Math.min(riskScore, 100);
    maintainabilityScore = Math.max(maintainabilityScore, 0);
    securityScore = Math.max(securityScore, 0);

    const overallScore = Math.round((maintainabilityScore + performanceScore + securityScore + (100 - riskScore)) / 4);

    let riskLevel = RiskLevel.Low;
    if (riskScore > 75) riskLevel = RiskLevel.Critical;
    else if (riskScore > 50) riskLevel = RiskLevel.High;
    else if (riskScore > 25) riskLevel = RiskLevel.Medium;

    return {
      overallScore,
      riskScore,
      maintainabilityScore,
      performanceScore,
      securityScore,
      riskLevel
    };
  }
}

export const reviewScorer = new ReviewScorer();
