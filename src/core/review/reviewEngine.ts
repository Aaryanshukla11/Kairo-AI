import { reviewRules } from './reviewRules';
import { reviewScorer } from './reviewScorer';
import { issueCollector } from './issueCollector';
import { recommendationEngine } from './recommendationEngine';
import { reviewValidator } from './reviewValidator';
import { reviewEvents } from './reviewEvents';
import { reviewMetrics } from './reviewMetrics';
import { SelfReviewReport, ReviewEventType } from './reviewTypes';

export class ReviewEngine {
  public async runReview(targetFile: string, content: string): Promise<SelfReviewReport> {
    reviewEvents.emit(ReviewEventType.ReviewStarted, { targetFile });

    // 1. Run Review Rules
    const issues = reviewRules.execute(content);
    for (const issue of issues) {
      reviewEvents.emit(ReviewEventType.IssueDetected, { issue });
    }

    // 2. Assign Severity & Collect Findings
    const { warnings, failedChecks } = issueCollector.collectIssues(issues);

    // 3. Calculate Score
    const overallScore = reviewScorer.calculateScore(issues);
    reviewEvents.emit(ReviewEventType.ScoreCalculated, { score: overallScore });

    // 4. Validate
    reviewValidator.validate(issues);

    // 5. Generate Recommendations
    const recommendations = recommendationEngine.generateRecommendations(issues);

    const report: SelfReviewReport = {
      overallScore,
      confidence: 0.95,
      passedChecks: issues.length === 0 ? ['REV-001', 'REV-002', 'REV-003'] : [],
      failedChecks,
      warnings,
      recommendations,
      riskLevel: overallScore >= 90 ? 'low' : overallScore >= 70 ? 'medium' : 'high',
      reviewSummary: `Self review completed for "${targetFile}" with score ${overallScore}/100.`
    };

    reviewMetrics.record(issues.length);
    reviewEvents.emit(ReviewEventType.ReviewCompleted, { report });

    return report;
  }

  public subscribe(listener: any): () => void {
    return reviewEvents.subscribe(listener);
  }
}

export const reviewEngine = new ReviewEngine();
