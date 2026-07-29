import { ExecutionPlanningInput, ExecutionPlanningReport } from './executionTypes';
import { executionPlanner } from './executionPlanner';
import { executionValidator } from './executionValidator';
import { executionEvents } from './executionEvents';
import { executionMetrics } from './executionMetrics';

export class ExecutionPlanningEngine {
  public async plan(input: ExecutionPlanningInput): Promise<ExecutionPlanningReport> {
    const startTime = Date.now();
    executionEvents.emit('ExecutionPlanningStarted', { taskCount: Object.keys(input.taskGraph.nodes).length });

    // Step 1 - 6: Assemble Execution Plan
    const plan = executionPlanner.planExecution(input);

    // Step 7: Validate Execution Plan
    const validationResult = executionValidator.validatePlan(plan);

    const durationMs = Date.now() - startTime;
    executionMetrics.record(durationMs, plan.checkpointPlan.length);

    const report: ExecutionPlanningReport = {
      reportId: `EPR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      planId: plan.planId,
      executionPlan: plan,
      executionGraph: {
        nodesCount: plan.schedule.steps.length,
        edgesCount: plan.schedule.steps.reduce((sum, s) => sum + s.dependencies.length, 0),
        criticalPathLength: input.taskGraph.criticalPath.length
      },
      confidence: validationResult.valid ? 0.96 : 0.5,
      validationPassed: validationResult.valid,
      validationErrors: validationResult.errors,
      timestamp: Date.now()
    };

    executionEvents.emit('ExecutionPlanningCompleted', report);
    return report;
  }

  public subscribe(listener: any): () => void {
    return executionEvents.subscribe(listener);
  }
}

export const executionPlanningEngine = new ExecutionPlanningEngine();
