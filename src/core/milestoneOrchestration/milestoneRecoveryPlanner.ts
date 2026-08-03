import { MilestoneNode, MilestoneRecoveryPlan } from './milestoneTypes';

export class MilestoneRecoveryPlanner {
  generateRecoveryPlans(milestones: MilestoneNode[]): MilestoneRecoveryPlan[] {
    const plans: MilestoneRecoveryPlan[] = [];

    milestones.forEach((m) => {
      plans.push({
        recoveryPlanId: `REC-PLAN-${m.id}`,
        milestoneId: m.id,
        rollbackBoundaryId: m.rollbackBoundary || `RB-${m.id}`,
        fallbackSteps: [
          `Pause milestone ${m.id} execution`,
          `Restore workspace snapshot for ${m.rollbackBoundary || `RB-${m.id}`}`,
          `Re-verify pre-requisite dependencies`
        ],
        retryCount: 0,
        maxRetries: 3,
        compensationActions: [
          `Log recovery failure for milestone ${m.id}`,
          `Revert uncommitted modifications in milestone tasks`
        ],
        recoveryConfidence: Number((m.confidence * 0.95).toFixed(2))
      });
    });

    return plans;
  }
}

export const milestoneRecoveryPlanner = new MilestoneRecoveryPlanner();
