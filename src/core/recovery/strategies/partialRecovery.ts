import { RecoveryStrategyType, RecoveryPlanModel } from '../recoveryTypes';

export class PartialRecoveryStrategy {
  plan(workflowId: string, failedStageId: string): RecoveryPlanModel {
    return {
      planId: `plan-part-${Date.now()}`,
      strategy: RecoveryStrategyType.PartialResume,
      steps: [`Isolate failure at ${failedStageId}`, 'Resume execution downstream'],
      estimatedTimeMs: 2500
    };
  }
}
