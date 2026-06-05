import { RecoveryStrategyType, RecoveryPlanModel, CheckpointModel } from './recoveryTypes';
import { recoveryStrategyRegistry } from './recoveryStrategies';

export class RecoveryPlanner {
  buildPlan(workflowId: string, strategy: RecoveryStrategyType, checkpoint?: CheckpointModel, stageId: string = 'stg-03'): RecoveryPlanModel {
    switch (strategy) {
      case RecoveryStrategyType.Retry:
        return recoveryStrategyRegistry.retry.plan(workflowId, stageId);
      case RecoveryStrategyType.Rollback:
        return recoveryStrategyRegistry.rollback.plan(workflowId, checkpoint?.workspaceSnapshot || 'snap-default');
      case RecoveryStrategyType.CheckpointRestore:
        return recoveryStrategyRegistry.checkpoint.plan(checkpoint || {
          checkpointId: 'chk-default',
          workflowVersion: '1.0',
          workspaceSnapshot: 'snap-default',
          transactionId: 'tx-0',
          executionState: 'Ready',
          recoveryMetadata: {},
          validationStatus: 'Verified'
        });
      case RecoveryStrategyType.WorkflowReconstruction:
        return recoveryStrategyRegistry.workflow.plan(workflowId);
      case RecoveryStrategyType.PartialResume:
        return recoveryStrategyRegistry.partial.plan(workflowId, stageId);
      case RecoveryStrategyType.ManualIntervention:
      default:
        return recoveryStrategyRegistry.manual.plan(workflowId, 'Manual intervention policy requested');
    }
  }
}

export const recoveryPlanner = new RecoveryPlanner();
