import { RecoveryStrategyType, RecoveryPlanModel } from '../recoveryTypes';

export class RollbackRecoveryStrategy {
  plan(workflowId: string, targetSnapshotId: string): RecoveryPlanModel {
    return {
      planId: `plan-rollback-${Date.now()}`,
      strategy: RecoveryStrategyType.Rollback,
      steps: [`Rollback workspace to snapshot ${targetSnapshotId}`, 'Re-verify workspace integrity'],
      estimatedTimeMs: 4000
    };
  }
}
