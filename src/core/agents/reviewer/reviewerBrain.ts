import { ExecutionPlan } from '../planner/plannerTypes';
import { ReviewReport } from './reviewerTypes';
import { reviewRules } from './reviewRules';
import { reviewScorer } from './reviewScorer';
import { reviewStrategies } from './reviewStrategies';

export class ReviewerBrain {
  /**
   * Compiles the ReviewReport based on active scores and recommendations.
   */
  public async reviewPlan(plan: ExecutionPlan): Promise<ReviewReport> {
    const issues = reviewRules.evaluate(plan);
    const scores = reviewScorer.calculateScores(issues);
    const recommendations = reviewStrategies.generateRecommendations(plan.strategy);

    const warnings = issues.map(i => i.description);
    const suggestedImprovements = [
      'Increase test coverage for modified segments.',
      'Document newly added interfaces.'
    ];

    return {
      planId: plan.id,
      ...scores,
      warnings,
      recommendations,
      suggestedImprovements
    };
  }
}

export const reviewerBrain = new ReviewerBrain();
