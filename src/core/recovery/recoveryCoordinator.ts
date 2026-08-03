import { RecoveryInput, RecoveryReport, RecoveryState } from './recoveryTypes';
import { failureClassifier } from './failureClassifier';
import { recoveryAnalyzer } from './recoveryAnalyzer';
import { checkpointRecoveryManager } from './checkpointRecovery';
import { recoveryPlanner } from './recoveryPlanner';
import { recoveryExecutor } from './recoveryExecutor';
import { recoveryEvents, RecoveryEventType } from './recoveryEvents';

export class RecoveryCoordinator {
  async processRecovery(input: RecoveryInput = {}): Promise<RecoveryReport> {
    const timestamp = Date.now();
    const workflowId = input.workflowId || 'WF-ACTIVE';

    // 1. Classify Failure
    const failureType = input.failureType || failureClassifier.classify(input.failureMessage, input.failedStageId);

    // 2. Select Strategy
    const strategy = recoveryAnalyzer.selectOptimalStrategy(failureType, input.preferredStrategy);

    // 3. Get Checkpoint
    const checkpoint = checkpointRecoveryManager.getLatestCheckpoint(workflowId);

    // 4. Build Plan
    const plan = recoveryPlanner.buildPlan(workflowId, strategy, checkpoint, input.failedStageId || 'stg-03');

    // 5. Execute Recovery Plan
    const { checkpointUsed, recoveredTasks, rollbackStatus, finalState } = await recoveryExecutor.executePlan(
      workflowId,
      plan,
      input.failedStageId || 'stg-03'
    );

    const report: RecoveryReport = {
      reportId: `REC-RPT-${timestamp}`,
      timestamp,
      workflowId,
      failureType,
      failureMessage: input.failureMessage || `Automatic recovery triggered for ${failureType}`,
      strategy,
      checkpointUsed,
      recoveredTasks,
      rollbackStatus,
      recoveryState: finalState,
      confidence: finalState === RecoveryState.Recovered ? 0.95 : 0.5,
      validationResult: {
        valid: finalState !== RecoveryState.FailedRecovery,
        errors: finalState === RecoveryState.FailedRecovery ? ['Recovery pipeline failed'] : [],
        warnings: []
      }
    };

    return report;
  }
}

export const recoveryCoordinator = new RecoveryCoordinator();
