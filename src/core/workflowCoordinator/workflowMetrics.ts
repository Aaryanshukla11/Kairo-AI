import { WorkflowMetricsModel, WorkflowStage } from './workflowTypes';

export class WorkflowMetricsCollector {
  private metrics: WorkflowMetricsModel = {
    totalWorkflows: 0,
    completedWorkflows: 0,
    failedWorkflows: 0,
    retriedWorkflows: 0,
    totalStagesExecuted: 0,
    avgConfidence: 1.0,
    totalRuntimeMs: 0
  };

  recordWorkflowRun(stages: WorkflowStage[], retriesCount: number): WorkflowMetricsModel {
    this.metrics.totalWorkflows += 1;
    this.metrics.totalStagesExecuted += stages.length;
    this.metrics.retriedWorkflows += retriesCount > 0 ? 1 : 0;

    const totalConf = stages.reduce((sum, s) => sum + s.confidence, 0);
    this.metrics.avgConfidence = stages.length > 0 ? Number((totalConf / stages.length).toFixed(2)) : 1.0;
    this.metrics.totalRuntimeMs = stages.reduce((sum, s) => sum + s.estimatedRuntimeMs, 0);

    return { ...this.metrics };
  }

  getMetrics(): WorkflowMetricsModel {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      retriedWorkflows: 0,
      totalStagesExecuted: 0,
      avgConfidence: 1.0,
      totalRuntimeMs: 0
    };
  }
}

export const workflowMetricsCollector = new WorkflowMetricsCollector();
