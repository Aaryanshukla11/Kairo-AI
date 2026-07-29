import { ReviewIssue } from './reviewTypes';

export class ReviewScorer {
  public calculateScore(issues: ReviewIssue[]): number {
    let score = 100;
    for (const issue of issues) {
      if (issue.severity === 'Suggestion') score -= 2;
      else if (issue.severity === 'Warning') score -= 10;
      else if (issue.severity === 'Error') score -= 25;
      else if (issue.severity === 'Critical') score -= 50;
    }
    return Math.max(0, score);
  }
}

export const reviewScorer = new ReviewScorer();
