import { ExecutionDelta } from './replanningTypes';

export class WorkflowComparator {
  compareWorkflows(oldStages: string[], newStages: string[], preservedStages: string[]): ExecutionDelta {
    const addedTasks = newStages.filter(s => !oldStages.includes(s));
    const removedTasks = oldStages.filter(s => !newStages.includes(s) && !preservedStages.includes(s));
    const modifiedTasks = newStages.filter(s => !preservedStages.includes(s) && oldStages.includes(s));

    return {
      addedTasks,
      removedTasks,
      modifiedTasks,
      preservedTasks: preservedStages
    };
  }
}

export const workflowComparator = new WorkflowComparator();
