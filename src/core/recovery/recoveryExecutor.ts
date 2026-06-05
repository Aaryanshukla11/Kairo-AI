import { RecoveryPlanModel, RecoveryState, CheckpointModel, RecoveryStrategyType } from './recoveryTypes';
import { checkpointRecoveryManager } from './checkpointRecovery';
import { rollbackRecoveryManager } from './rollbackRecovery';
import { workflowRecoveryManager } from './workflowRecovery';

export class RecoveryExecutor {
  async executePlan(workflowId: string, plan: RecoveryPlanModel, stageId: string = 'stg-03'): Promise<{
    checkpointUsed?: CheckpointModel;
    recoveredTasks: string[];
    rollbackStatus: 'Success' | 'NotRequired' | 'Failed';
    finalState: RecoveryState;
  }> {
    let checkpointUsed: CheckpointModel | undefined;
    let rollbackStatus: 'Success' | 'NotRequired' | 'Failed' = 'NotRequired';

    if (plan.strategy === RecoveryStrategyType.CheckpointRestore) {
      checkpointUsed = plan.targetCheckpoint || checkpointRecoveryManager.getLatestCheckpoint(workflowId);
      checkpointRecoveryManager.restoreCheckpoint(checkpointUsed);
    } else if (plan.strategy === RecoveryStrategyType.Rollback) {
      rollbackStatus = rollbackRecoveryManager.performRollback(workflowId, 'snap-target');
    }

    const recoveredTasks = workflowRecoveryManager.resumeWorkflow(workflowId, stageId);

    const finalState = plan.strategy === RecoveryStrategyType.ManualIntervention ? RecoveryState.ManualIntervention : RecoveryState.Recovered;

    return {
      checkpointUsed,
      recoveredTasks,
      rollbackStatus,
      finalState
    };
  }
}

export const recoveryExecutor = new RecoveryExecutor();
