import { HTNNode } from './htnTypes';
import { TaskModel } from '../../taskTypes';

export class HTNEngine {
  public buildHTNTree(featurePlan: any, taskModels: TaskModel[]): HTNNode {
    const rootNode: HTNNode = {
      id: featurePlan.planId || 'FEAT-ROOT',
      level: 'Feature',
      title: featurePlan.title || 'Feature Plan',
      objective: featurePlan.description || 'Implement feature plan',
      preconditions: ['Workspace context initialized', 'Plan approved'],
      postconditions: ['Feature components implemented and tested'],
      dependencies: [],
      successCriteria: ['All milestones completed', 'Validation suite passing'],
      failureRecovery: 'Rollback to workspace snapshot',
      children: []
    };

    const msMap = new Map<string, HTNNode>();

    for (const ms of featurePlan.milestones || []) {
      const msNode: HTNNode = {
        id: ms.milestoneId,
        level: 'Milestone',
        title: ms.name,
        objective: ms.description,
        preconditions: ['Preceding milestone completed'],
        postconditions: ['Milestone artifacts verified'],
        dependencies: [],
        successCriteria: ['All milestone tasks passing'],
        failureRecovery: `Re-run milestone ${ms.milestoneId} tasks`,
        children: []
      };
      msMap.set(ms.milestoneId, msNode);
      rootNode.children.push(msNode);
    }

    for (const task of taskModels) {
      const taskNode: HTNNode = {
        id: task.taskId,
        level: 'Task',
        title: task.title,
        objective: task.description,
        preconditions: task.dependencies.map(d => `Task ${d} completed`),
        postconditions: [`Output: ${task.expectedOutput}`],
        dependencies: [...task.dependencies],
        successCriteria: ['No compilation or lint errors'],
        failureRecovery: 'Retry task execution with corrected context',
        children: [
          {
            id: `SUB-${task.taskId}-1`,
            level: 'Subtask',
            title: `Prepare context for ${task.title}`,
            objective: 'Load symbols and file handles',
            preconditions: [],
            postconditions: ['Context ready'],
            dependencies: [],
            successCriteria: ['Handles verified'],
            failureRecovery: 'Reload workspace state',
            children: [
              {
                id: `ACT-${task.taskId}-1`,
                level: 'Atomic Action',
                title: `Execute patch modification for ${task.taskId}`,
                objective: 'Apply changes',
                preconditions: [],
                postconditions: ['Diff applied'],
                dependencies: [],
                successCriteria: ['Diff matches target'],
                failureRecovery: 'Revert diff',
                children: []
              }
            ]
          }
        ]
      };

      const parentMs = msMap.get(task.parentMilestone);
      if (parentMs) {
        parentMs.children.push(taskNode);
      } else {
        rootNode.children.push(taskNode);
      }
    }

    return rootNode;
  }
}
export const htnEngine = new HTNEngine();
