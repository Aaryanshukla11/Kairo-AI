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

    const decision = issues.length > 0 ? 'REPAIR_REQUIRED' : 'PASS';
    const structuredRepairIssues = issues.map(i => ({
      severity: i.severity === 'critical' || i.severity === 'high' ? ('CRITICAL' as const) : ('HIGH' as const),
      filePath: (i as any).location || 'src/components/App.tsx',
      issueType: 'MISSING_EXPORT' as const,
      exactProblem: i.description,
      affectedSymbol: (i as any).ruleId || i.type,
      suggestedFix: `Repair issue in ${(i as any).location || 'component'}`
    }));

    return {
      planId: plan.id,
      ...scores,
      warnings,
      recommendations,
      suggestedImprovements,
      decision,
      structuredRepairIssues
    };
  }
}

export const reviewerBrain = new ReviewerBrain();
