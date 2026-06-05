import { pipelineExecutor } from './pipelineExecutor';
import { integrationHistory } from './integrationHistory';
import { integrationMetrics } from './integrationMetrics';
import { integrationEvents } from './integrationEvents';
import { PipelineStepResult, IntegrationHistoryEntry, PlatformValidationEventType } from './validationTypes';

export class IntegrationCoordinator {
  public async executeAndTrack(reportId: string): Promise<PipelineStepResult[]> {
    const timestamp = Date.now();
    const runId = `run-${timestamp}`;

    integrationEvents.emit(PlatformValidationEventType.ValidationStarted, { reportId, runId });

    const steps = await pipelineExecutor.executePipeline(runId);

    const failedSteps = steps
      .filter(s => s.status === 'Failed')
      .map(s => s.stage);

    const successCount = steps.filter(s => s.status === 'Success').length;
    const overallScore = Math.round((successCount / steps.length) * 100);
    const pipelineStatus = overallScore === 100 ? 'Success' : overallScore >= 80 ? 'Warning' : 'Failed';

    const historyEntry: IntegrationHistoryEntry = {
      timestamp,
      reportId,
      overallScore,
      pipelineStatus,
      failedSteps
    };

    integrationHistory.recordEntry(historyEntry);
    integrationEvents.emit(PlatformValidationEventType.ValidationCompleted, { reportId, runId, entry: historyEntry });

    return steps;
  }

  public getHistory(): IntegrationHistoryEntry[] {
    return integrationHistory.getHistory();
  }

  public getMetricsSummary() {
    return {
      successRate: integrationHistory.getSuccessRate(),
      totalRuns: integrationHistory.getHistory().length
    };
  }
}

export const integrationCoordinator = new IntegrationCoordinator();
