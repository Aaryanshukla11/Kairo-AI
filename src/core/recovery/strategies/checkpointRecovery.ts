import { RecoveryStrategyType, RecoveryPlanModel, CheckpointModel } from '../recoveryTypes';

export class CheckpointRecoveryStrategy {
  plan(checkpoint: CheckpointModel): RecoveryPlanModel {
    return {
      planId: `plan-chk-${Date.now()}`,
      strategy: RecoveryStrategyType.CheckpointRestore,
      targetCheckpoint: checkpoint,
      steps: [`Restore checkpoint ${checkpoint.checkpointId}`, `Re-populate verified tasks metadata`],
      estimatedTimeMs: 3000
    };
  }
}
