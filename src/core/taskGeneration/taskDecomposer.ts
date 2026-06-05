import { TaskGenerationInput, TaskModel } from './taskTypes';
import { taskAnalyzer } from './taskAnalyzer';
import { taskBuilder } from './taskBuilder';

export class TaskDecomposer {
  public decomposePlan(input: TaskGenerationInput): TaskModel[] {
    const milestoneAnalyses = taskAnalyzer.analyzeMilestones(input);
    const allTasks: TaskModel[] = [];

    let previousMilestoneLastTaskId: string | null = null;

    for (const analysis of milestoneAnalyses) {
      const msTasks = taskBuilder.buildTasksForMilestone(analysis);

      // Link tasks within the milestone in logical dependency order
      // DB -> API -> Backend -> UI -> Testing
      const typePriorityOrder: Record<string, number> = {
        'Database Task': 1,
        'API Task': 2,
        'Backend Task': 3,
        'UI Task': 4,
        'Testing Task': 5
      };

      msTasks.sort((a, b) => (typePriorityOrder[a.taskType] || 3) - (typePriorityOrder[b.taskType] || 3));

      for (let i = 0; i < msTasks.length; i++) {
        const current = msTasks[i];
        if (i > 0) {
          current.dependencies.push(msTasks[i - 1].taskId);
        } else if (previousMilestoneLastTaskId) {
          // Cross-milestone link: first task of this milestone depends on last task of previous milestone
          current.dependencies.push(previousMilestoneLastTaskId);
        }
      }

      if (msTasks.length > 0) {
        previousMilestoneLastTaskId = msTasks[msTasks.length - 1].taskId;
      }

      allTasks.push(...msTasks);
    }

    return allTasks;
  }
}
export const taskDecomposer = new TaskDecomposer();
