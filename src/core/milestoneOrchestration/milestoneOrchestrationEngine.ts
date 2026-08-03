import {
  MilestoneOrchestrationInput,
  MilestoneOrchestrationReport,
  MilestoneStrategyType
} from './milestoneTypes';
import { milestonePlanner } from './milestonePlanner';
import { milestoneDependencyResolver } from './milestoneDependencyResolver';
import { milestoneCoordinator } from './milestoneCoordinator';
import { milestoneCheckpointManager } from './milestoneCheckpointManager';
import { milestoneRecoveryPlanner } from './milestoneRecoveryPlanner';
import { milestoneValidator } from './milestoneValidator';
import { milestoneMetricsCollector } from './milestoneMetrics';
import { milestoneEvents, MilestoneEventType } from './milestoneEvents';

export class MilestoneOrchestrationEngine {
  async orchestrate(input: MilestoneOrchestrationInput = {}): Promise<MilestoneOrchestrationReport> {
    const reportId = `MOR-${Date.now()}`;
    const timestamp = Date.now();

    // 1. Load Execution Plan / Plan Milestones
    const milestones = milestonePlanner.planMilestones(input);

    // 2. Resolve Milestones & Dependencies
    const executionOrder = milestoneDependencyResolver.resolveExecutionOrder(milestones);

    // 3. Assign Execution Strategy & Coordinate Workflow
    const strategy = input.strategy || MilestoneStrategyType.Hybrid;
    const workflow = milestoneCoordinator.coordinate(milestones, executionOrder, strategy);

    // 4. Generate Checkpoints
    const checkpoints = milestoneCheckpointManager.generateCheckpoints(milestones);

    // 5. Generate Recovery Plan
    const recoveryPlans = milestoneRecoveryPlanner.generateRecoveryPlans(milestones);

    // 6. Validate Workflow
    const validationResult = milestoneValidator.validate(
      milestones,
      executionOrder,
      checkpoints,
      recoveryPlans
    );

    // 7. Calculate Metrics & Overall Execution Confidence
    const metrics = milestoneMetricsCollector.recordOrchestration(
      milestones,
      checkpoints.length,
      recoveryPlans.length
    );

    const overallConfidence = validationResult.valid
      ? metrics.avgConfidence
      : Number((metrics.avgConfidence * 0.5).toFixed(2));

    const report: MilestoneOrchestrationReport = {
      reportId,
      timestamp,
      executionPlanId: input.executionPlanId || `EXP-${timestamp}`,
      workflow,
      checkpoints,
      recoveryPlans,
      executionConfidence: overallConfidence,
      metrics,
      validationResult
    };

    if (validationResult.valid) {
      milestoneEvents.emitEvent(MilestoneEventType.ORCHESTRATION_COMPLETED, {
        timestamp,
        report
      });
    } else {
      milestoneEvents.emitEvent(MilestoneEventType.ORCHESTRATION_FAILED, {
        timestamp,
        report,
        error: validationResult.errors.join('; ')
      });
    }

    return report;
  }
}

export const milestoneOrchestrationEngine = new MilestoneOrchestrationEngine();
