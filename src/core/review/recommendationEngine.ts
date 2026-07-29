import { ReviewIssue } from './reviewTypes';

export class RecommendationEngine {
  public generateRecommendations(issues: ReviewIssue[]): string[] {
    const recs: string[] = [];
    for (const issue of issues) {
      if (issue.ruleId === 'REV-001') {
        recs.push('Replace temporary TODO items with proper handler actions.');
      } else if (issue.ruleId === 'REV-002') {
        recs.push('Refactor broad modules into multiple sub-components.');
      } else if (issue.ruleId === 'REV-003') {
        recs.push('Define custom TypeScript types to replace broad "any" types.');
      }
    }

    if (recs.length === 0) {
      recs.push('Artifact conforms to coding conventions. No recommendations.');
    }
    return recs;
  }
}

export const recommendationEngine = new RecommendationEngine();
