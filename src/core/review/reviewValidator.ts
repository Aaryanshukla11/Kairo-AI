import { ReviewIssue } from './reviewTypes';

export class ReviewValidator {
  public validate(issues: ReviewIssue[]): void {
    const critical = issues.find(i => i.severity === 'Critical');
    if (critical) {
      throw new Error(`Self Review validation failure: Critical issue caught: ${critical.message}`);
    }
  }
}

export const reviewValidator = new ReviewValidator();
