import { IProjectManifest } from '../project-manifest';
import { IGenerationPlan, IGenerationTask } from './schema';
import { taskGraphBuilder } from './task-graph';
import { checkpointModeler } from './checkpoint';
import { logger } from '../logger';

export class GenerationPlannerEngine {
  public generatePlan(manifest: IProjectManifest): IGenerationPlan {
    logger.info(`[GenerationPlannerEngine] Translating project manifest into structured execution plan for Project: '${manifest.projectName}'`);

    const planId = `plan-${Date.now()}`;

    // 1. Convert manifest steps into structured planning tasks
    const tasks: IGenerationTask[] = [];

    // Helper map to translate manifest step generator IDs to task IDs
    const taskMap = new Map<string, string>([
      ['WorkspaceScaffolder', 'task-scaffold-workspace'],
      ['TypesGenerator', 'task-generate-types'],
      ['ConfigGenerator', 'task-generate-configs'],
      ['DatabaseGenerator', 'task-generate-database'],
      ['BackendGenerator', 'task-generate-backend'],
      ['FrontendGenerator', 'task-generate-frontend']
    ]);

    for (const step of manifest.executionPlan.steps) {
      const id = taskMap.get(step.generatorId) || `task-${step.generatorId.toLowerCase()}`;
      
      // Compute dependencies based on step execution priority
      const dependencies: string[] = [];
      if (step.generatorId !== 'WorkspaceScaffolder') {
        dependencies.push('task-scaffold-workspace');
      }
      if (step.generatorId === 'DatabaseGenerator' && taskMap.has('ConfigGenerator')) {
        dependencies.push('task-generate-configs');
      }
      if (step.generatorId === 'BackendGenerator' && taskMap.has('DatabaseGenerator')) {
        dependencies.push('task-generate-database');
      }
      if (step.generatorId === 'FrontendGenerator' && taskMap.has('BackendGenerator')) {
        dependencies.push('task-generate-backend');
      }

      tasks.push({
        id,
        name: step.stageName,
        description: `Compile files targeting generator: ${step.generatorId}`,
        assignedGeneratorId: step.generatorId,
        priority: step.executionPriority,
        dependencies,
        expectedOutputs: [],
        validationRules: step.validationRules,
        rollbackPointId: `rb-${id}`,
        maxRetries: step.retryCount,
        retryDelayMs: 2000,
        estimatedComplexity: 'MEDIUM',
        estimatedDurationSeconds: 15,
        failureStrategy: step.failureAction
      });
    }

    // 2. Build DAG
    const taskGraph = taskGraphBuilder.buildGraph(tasks);

    // 3. Topological sorting
    const { ordered, cycles } = taskGraphBuilder.sortTopologically(taskGraph);

    // 4. Parallel execution opportunities grouping
    const parallelGroups: string[][] = [];
    const inDegreeMap = new Map<string, number>();
    for (const node of tasks) {
      inDegreeMap.set(node.id, node.dependencies.length);
    }

    // A simple grouping where tasks with identical degrees and no cross-dependencies run together
    const processed = new Set<string>();
    while (processed.size < tasks.length) {
      const concurrentBatch: string[] = [];
      for (const t of tasks) {
        if (!processed.has(t.id)) {
          // Check if all its dependencies are already processed
          const depsMet = t.dependencies.every(d => processed.has(d));
          if (depsMet) {
            concurrentBatch.push(t.id);
          }
        }
      }
      if (concurrentBatch.length === 0) {
        // Cycles or unreachable nodes
        break;
      }
      parallelGroups.push(concurrentBatch);
      concurrentBatch.forEach(id => processed.add(id));
    }

    // 5. Checkpoints models
    const checkpoints = checkpointModeler.designCheckpoints();

    // 6. Validation reports
    const validationReport = {
      isValid: cycles.length === 0,
      violations: cycles.length > 0 ? [`Circular task graph dependencies detected: ${cycles.join(' -> ')}`] : []
    };

    const result: IGenerationPlan = {
      planId,
      taskGraph,
      orderedTaskList: ordered,
      parallelGroups,
      checkpoints,
      validationReport
    };

    logger.info(`[GenerationPlannerEngine] Scaffolding plan completed. Tasks Count: ${ordered.length}. Parallel Groups Count: ${parallelGroups.length}. Status: ${validationReport.isValid ? 'VALID' : 'INVALID'}`);
    return Object.freeze(result);
  }
}

export const generationPlannerEngine = new GenerationPlannerEngine();
export default generationPlannerEngine;
export * from './schema';
export * from './task-graph';
export * from './checkpoint';
export { TaskGraphBuilder } from './task-graph';
export { CheckpointModeler } from './checkpoint';
