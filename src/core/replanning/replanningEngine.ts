import { ReplanningInput, ReplanningReport } from './replanningTypes';
import { replanningCoordinator } from './replanningCoordinator';
import { replanningHistoryManager } from './replanningHistory';
import { replanningMetricsCollector } from './replanningMetrics';
import { replanningEvents, ReplanningEventType } from './replanningEvents';

export class ReplanningEngine {
  async replan(input: ReplanningInput = {}): Promise<ReplanningReport> {
    const startTime = Date.now();
    replanningEvents.emitEvent(ReplanningEventType.REPLANNING_STARTED, { timestamp: startTime, workflowId: input.workflowId });

    const report = await replanningCoordinator.processReplanning(input);

    replanningHistoryManager.record(report);
    replanningMetricsCollector.recordReplan(
      report.impact.preservedTaskIds.length,
      report.impact.affectedTaskIds.length,
      report.confidence,
      Date.now() - startTime
    );

    if (report.validationResult.valid) {
      replanningEvents.emitEvent(ReplanningEventType.REPLANNING_COMPLETED, { timestamp: Date.now(), report });
    } else {
      replanningEvents.emitEvent(ReplanningEventType.REPLANNING_FAILED, { timestamp: Date.now(), report, error: report.validationResult.errors.join('; ') });
    }

    return report;
  }
}

export const replanningEngine = new ReplanningEngine();
