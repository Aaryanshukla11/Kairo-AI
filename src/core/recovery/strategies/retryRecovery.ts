import { RecoveryStrategyType, RecoveryPlanModel } from '../recoveryTypes';

export class RetryRecoveryStrategy {
  plan(workflowId: string, stageId: string): RecoveryPlanModel {
    return {
      planId: `plan-retry-${Date.now()}`,
      strategy: RecoveryStrategyType.Retry,
      steps: [`Re-queue stage ${stageId} with exponential backoff`],
      estimatedTimeMs: 2000
    };
  }
}
