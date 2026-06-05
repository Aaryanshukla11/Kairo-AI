import { RecoveryInput, RecoveryReport, RecoveryState } from './recoveryTypes';
import { recoveryCoordinator } from './recoveryCoordinator';
import { recoveryHistoryManager } from './recoveryHistory';
import { recoveryMetricsCollector } from './recoveryMetrics';
import { recoveryEvents, RecoveryEventType } from './recoveryEvents';

export class RecoveryEngine {
  async recover(input: RecoveryInput = {}): Promise<RecoveryReport> {
    const startTime = Date.now();
    recoveryEvents.emitEvent(RecoveryEventType.FAILURE_DETECTED, {
      timestamp: startTime,
      workflowId: input.workflowId,
      failureType: input.failureType
    });

    const report = await recoveryCoordinator.processRecovery(input);

    recoveryHistoryManager.record(report);
    recoveryMetricsCollector.recordRecovery(
      !!report.checkpointUsed,
      report.rollbackStatus === 'Success',
      report.confidence,
      Date.now() - startTime
    );

    if (report.recoveryState === RecoveryState.Recovered) {
      recoveryEvents.emitEvent(RecoveryEventType.RECOVERY_COMPLETED, { timestamp: Date.now(), report });
    } else {
      recoveryEvents.emitEvent(RecoveryEventType.RECOVERY_FAILED, { timestamp: Date.now(), report });
    }

    return report;
  }
}

export const recoveryEngine = new RecoveryEngine();
