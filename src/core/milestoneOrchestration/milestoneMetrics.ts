import { MilestoneOrchestrationMetrics, MilestoneNode } from './milestoneTypes';

export class MilestoneMetricsCollector {
  private metrics: MilestoneOrchestrationMetrics = {
    totalMilestones: 0,
    completedMilestones: 0,
    failedMilestones: 0,
    totalCheckpoints: 0,
    totalRecoveryPlans: 0,
    avgConfidence: 1.0,
    totalRuntimeMs: 0,
    totalTokens: 0
  };

  recordOrchestration(milestones: MilestoneNode[], checkpointsCount: number, recoveryPlansCount: number): MilestoneOrchestrationMetrics {
    this.metrics.totalMilestones = milestones.length;
    this.metrics.completedMilestones = milestones.filter(m => m.status === 'Completed').length;
    this.metrics.failedMilestones = milestones.filter(m => m.status === 'Failed').length;
    this.metrics.totalCheckpoints = checkpointsCount;
    this.metrics.totalRecoveryPlans = recoveryPlansCount;

    const totalConf = milestones.reduce((sum, m) => sum + m.confidence, 0);
    this.metrics.avgConfidence = milestones.length > 0 ? Number((totalConf / milestones.length).toFixed(2)) : 1.0;

    this.metrics.totalRuntimeMs = milestones.reduce((sum, m) => sum + m.estimatedRuntime, 0);
    this.metrics.totalTokens = milestones.reduce((sum, m) => sum + m.estimatedTokens, 0);

    return { ...this.metrics };
  }

  getMetrics(): MilestoneOrchestrationMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalMilestones: 0,
      completedMilestones: 0,
      failedMilestones: 0,
      totalCheckpoints: 0,
      totalRecoveryPlans: 0,
      avgConfidence: 1.0,
      totalRuntimeMs: 0,
      totalTokens: 0
    };
  }
}

export const milestoneMetricsCollector = new MilestoneMetricsCollector();
