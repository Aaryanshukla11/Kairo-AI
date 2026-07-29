import { PlannerTaskItem, PlannerTaskType } from '../planner/plannerTypes';

export class ExecutorBrain {
  /**
   * Translates planner tasks classifications to corresponding target tool adapter invocations.
   */
  public resolveToolCall(task: PlannerTaskItem): { toolId: string; args: any } {
    switch (task.type) {
      case PlannerTaskType.Analyze:
      case PlannerTaskType.Review:
        return {
          toolId: 'workspace-tool',
          args: { action: 'scan', path: '.' }
        };
      case PlannerTaskType.Create:
      case PlannerTaskType.Modify:
        return {
          toolId: 'filesystem-tool',
          args: { path: task.affectedFiles[0] || 'src/dummy.txt', content: 'mock' }
        };
      case PlannerTaskType.Test:
        return {
          toolId: 'terminal-tool',
          args: { command: 'npm test' }
        };
      default:
        return {
          toolId: 'diagnostics-tool',
          args: { filter: 'errors' }
        };
    }
  }
}

export const executorBrain = new ExecutorBrain();
