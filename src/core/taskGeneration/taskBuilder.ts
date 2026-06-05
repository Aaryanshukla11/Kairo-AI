import { TaskModel, TaskType } from './taskTypes';
import { uiTaskStrategy, backendTaskStrategy, apiTaskStrategy, databaseTaskStrategy, testingTaskStrategy } from './strategies';
import { MilestoneAnalysis } from './taskAnalyzer';

export class TaskBuilder {
  public buildTasksForMilestone(analysis: MilestoneAnalysis): TaskModel[] {
    const tasks: TaskModel[] = [];
    let idx = 1;

    for (const type of analysis.detectedTypes) {
      const taskId = `TASK-${analysis.milestoneId}-${idx++}`;
      let task: TaskModel;

      switch (type) {
        case 'UI Task':
          task = uiTaskStrategy.buildTask({
            taskId,
            title: `UI: ${analysis.name}`,
            description: `Implement UI views and layout for ${analysis.description}`,
            parentMilestone: analysis.milestoneId,
            requiredFiles: analysis.suggestedFiles.filter(f => f.includes('webview') || f.endsWith('.tsx'))
          });
          break;

        case 'API Task':
          task = apiTaskStrategy.buildTask({
            taskId,
            title: `API: ${analysis.name}`,
            description: `Define API endpoints and data contract for ${analysis.description}`,
            parentMilestone: analysis.milestoneId
          });
          break;

        case 'Database Task':
          task = databaseTaskStrategy.buildTask({
            taskId,
            title: `DB: ${analysis.name}`,
            description: `Setup database schema models for ${analysis.description}`,
            parentMilestone: analysis.milestoneId
          });
          break;

        case 'Testing Task':
          task = testingTaskStrategy.buildTask({
            taskId,
            title: `Test: ${analysis.name}`,
            description: `Write automated tests verifying ${analysis.description}`,
            parentMilestone: analysis.milestoneId
          });
          break;

        case 'Backend Task':
        default:
          task = backendTaskStrategy.buildTask({
            taskId,
            title: `Backend: ${analysis.name}`,
            description: `Implement backend service logic for ${analysis.description}`,
            parentMilestone: analysis.milestoneId,
            requiredFiles: analysis.suggestedFiles.filter(f => !f.includes('webview'))
          });
          break;
      }

      tasks.push(task);
    }

    return tasks;
  }
}
export const taskBuilder = new TaskBuilder();
