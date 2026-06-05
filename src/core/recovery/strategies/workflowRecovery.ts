import { RecoveryStrategyType, RecoveryPlanModel } from '../recoveryTypes';

export class WorkflowRecoveryStrategy {
  plan(workflowId: string): RecoveryPlanModel {
    return {
      planId: `plan-wf-${Date.now()}`,
      strategy: RecoveryStrategyType.WorkflowReconstruction,
      steps: ['Reconstruct workflow DAG', 'Re-index transitive dependencies'],
      estimatedTimeMs: 5000
    };
  }
}
