import { ExecutionPlanningInput, ExecutionPlan } from './executionTypes';
import { executionAnalyzer } from './executionAnalyzer';
import { checkpointPlanner } from './checkpointPlanner';
import { rollbackBoundaryPlanner } from './rollbackBoundaryPlanner';
import { resourcePlanner } from './resourcePlanner';
import { executionScheduler } from './executionScheduler';
import { executionOptimizer } from './executionOptimizer';

export class ExecutionPlanner {
  public planExecution(input: ExecutionPlanningInput): ExecutionPlan {
    const maxWorkers = input.executionPolicies?.maxWorkers || 4;
    const preferParallelism = input.executionPolicies?.preferParallelism ?? true;

    // 1. Analyze Task Graph
    const analysis = executionAnalyzer.analyzeGraph(input.taskGraph, preferParallelism);

    // 2. Schedule Execution Steps
    const schedule = executionScheduler.schedule(input.taskGraph, analysis.recommendedStrategy, maxWorkers);

    // 3. Plan Checkpoints
    const checkpoints = checkpointPlanner.planCheckpoints(input.taskGraph, schedule.steps);
    executionScheduler.attachCheckpointsToSchedule(schedule, checkpoints);

    // 4. Plan Rollback Boundaries
    const rollbackBoundaries = rollbackBoundaryPlanner.planRollbackBoundaries(checkpoints, input.taskGraph, schedule.steps);

    // 5. Plan Resource Allocation
    const resources = resourcePlanner.planResources(input.taskGraph, maxWorkers, input.resourceConstraints);

    // 6. Optimize Schedule
    executionOptimizer.optimizeSchedule(schedule, maxWorkers);

    return {
      planId: `EPL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      strategy: analysis.recommendedStrategy,
      schedule,
      checkpointPlan: checkpoints,
      rollbackBoundaries,
      resourcePlan: resources,
      overallRisk: analysis.overallRisk,
      totalTasks: analysis.totalNodes
    };
  }
}
export const executionPlanner = new ExecutionPlanner();
