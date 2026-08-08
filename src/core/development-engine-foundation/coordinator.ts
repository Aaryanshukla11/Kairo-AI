import { IDevelopmentRequest } from '../planning-validator-handoff/types';
import { IGenerationExecution, TaskProgressState, IGenerationError, IGenerationReport } from './types';
import { generatorScheduler } from './scheduler';
import { generatorRegistry } from './registry';
import * as crypto from 'crypto';

export class DevelopmentCoordinator {
  public prepareExecution(request: IDevelopmentRequest): IGenerationExecution {
    const executionId = crypto.randomUUID ? crypto.randomUUID() : `exec-${Date.now()}`;
    
    // Resolve execution queue
    const executionQueue = generatorScheduler.determineExecutionQueue(request.validatedTaskGraph);

    // Initialize progress map
    const progress: Record<string, TaskProgressState> = {};
    for (const task of request.validatedTaskGraph) {
      progress[task.taskId] = 'PENDING';
    }

    // Verify task dispatching rules (ensure generators exist for types)
    const errors: IGenerationError[] = [];
    const completedTasks: string[] = [];
    const skippedTasks: string[] = [];
    const failedTasks: string[] = [];

    for (const task of request.validatedTaskGraph) {
      const matchGen = generatorRegistry.getGeneratorForType(task.taskType);
      if (!matchGen) {
        progress[task.taskId] = 'FAILED';
        failedTasks.push(task.taskId);
        errors.push({
          taskId: task.taskId,
          generator: 'None',
          category: 'DISPATCH',
          message: `No registered generator found to handle task type '${task.taskType}'`,
          severity: 'CRITICAL',
          timestamp: Date.now()
        });
      }
    }

    const report: IGenerationReport = {
      completedTasks: Object.freeze(completedTasks),
      skippedTasks: Object.freeze(skippedTasks),
      failedTasks: Object.freeze(failedTasks),
      executionTimeMs: 0,
      warnings: Object.freeze([...request.warnings]),
      errors: Object.freeze(errors)
    };

    return {
      executionId,
      project: {
        name: request.projectInfo.name,
        type: request.projectInfo.type
      },
      taskGraph: request.validatedTaskGraph,
      executionQueue: Object.freeze(executionQueue),
      generators: Object.freeze(generatorRegistry.getAllGeneratorIds()),
      progress: Object.freeze(progress),
      report
    };
  }
}

export const developmentCoordinator = new DevelopmentCoordinator();
export default developmentCoordinator;
