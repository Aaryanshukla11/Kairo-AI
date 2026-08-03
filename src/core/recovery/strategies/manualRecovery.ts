import { RecoveryStrategyType, RecoveryPlanModel } from '../recoveryTypes';

export class ManualRecoveryStrategy {
  plan(workflowId: string, reason: string): RecoveryPlanModel {
    return {
      planId: `plan-man-${Date.now()}`,
      strategy: RecoveryStrategyType.ManualIntervention,
      steps: ['Pause automated execution', `Wait for user approval / fix for: ${reason}`],
      estimatedTimeMs: 0
    };
  }
}
