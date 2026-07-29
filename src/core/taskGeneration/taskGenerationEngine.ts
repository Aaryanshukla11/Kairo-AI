import { TaskGenerationInput, TaskGenerationReport, TaskRiskLevel } from './taskTypes';
import { taskDecomposer } from './taskDecomposer';
import { taskDependencyResolver } from './taskDependencyResolver';
import { taskPrioritizer } from './taskPrioritizer';
import { taskEstimator } from './taskEstimator';
import { taskScheduler } from './taskScheduler';
import { taskValidator } from './taskValidator';
import { taskEvents } from './taskEvents';
import { taskMetrics } from './taskMetrics';
import { htnEngine, taskKnowledgeGraph, taskConstraintEngine, taskResourceModel, taskRecoveryPlanner, taskDecisionEngine, taskVersionTracker, taskObservabilityEngine } from './intelligence';

export class TaskGenerationEngine {
  public async generateTasks(input: TaskGenerationInput): Promise<TaskGenerationReport> {
    const startTime = Date.now();
    taskEvents.emit('TaskGenerationStarted', { planId: input.featurePlan.planId });

    // Step 1 & 2: Analyze & Decompose Plan into Task Models
    const taskModels = taskDecomposer.decomposePlan(input);

    // Step 3: Resolve Dependencies & Build DAG Task Graph
    const taskGraph = taskDependencyResolver.buildTaskGraph(taskModels);

    // Step 4: Prioritize Tasks
    taskPrioritizer.prioritizeGraph(taskGraph);

    // Step 5: Estimate Complexity & Effort
    const effortStats = taskEstimator.refineEstimates(taskGraph);

    // Step 6: Compute Deterministic Execution Order & Parallel Branches
    const schedule = taskScheduler.computeSchedule(taskGraph);

    // Step 7: Validate Task Graph
    const validationResult = taskValidator.validate(taskGraph, input);

    // Determine overall risk level
    let overallRisk: TaskRiskLevel = 'Minimal';
    const hasHighRisk = Object.values(taskGraph.nodes).some(n => n.task.risk === 'High' || n.task.risk === 'Critical');
    if (hasHighRisk) {
      overallRisk = 'High';
    } else if (effortStats.totalTasks > 10) {
      overallRisk = 'Medium';
    }

    const durationMs = Date.now() - startTime;
    taskMetrics.record(effortStats.totalTasks, durationMs);

    // Compute Intelligence Pack Data
    const htnTree = htnEngine.buildHTNTree(input.featurePlan, taskModels);
    const knowledgeGraph = taskKnowledgeGraph.buildMetadataMap(taskModels);
    const constraints = taskConstraintEngine.solveConstraints(taskModels);
    const resources = taskResourceModel.estimateResources(taskModels);
    const recoveryPlans = taskRecoveryPlanner.planRecovery(taskModels);
    const decisions = taskDecisionEngine.evaluateDecisions(taskModels);
    const versions = taskVersionTracker.initializeVersions(taskModels);
    const observability = taskObservabilityEngine.computeObservability(taskGraph, durationMs);

    const report: TaskGenerationReport = {
      reportId: `TRP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      planId: input.featurePlan.planId,
      taskGraph,
      executionOrder: schedule.executionOrder,
      parallelBranches: schedule.parallelBranches,
      taskDependencies: Object.values(taskGraph.nodes).map(n => ({
        taskId: n.task.taskId,
        dependsOn: n.parents
      })),
      estimatedEffort: effortStats,
      riskLevel: overallRisk,
      confidence: validationResult.valid ? 0.95 : 0.4,
      validationPassed: validationResult.valid,
      validationErrors: validationResult.errors,
      intelligence: {
        htnTree,
        knowledgeGraph,
        constraints,
        resources,
        recoveryPlans,
        decisions,
        versions,
        observability
      },
      timestamp: Date.now()
    };

    taskEvents.emit('TaskGenerationCompleted', report);
    return report;
  }

  public subscribe(listener: any): () => void {
    return taskEvents.subscribe(listener);
  }
}

export const taskGenerationEngine = new TaskGenerationEngine();
