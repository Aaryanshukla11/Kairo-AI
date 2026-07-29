import { TaskVersionRecord } from './versionTypes';
import { TaskModel } from '../../taskTypes';

export class TaskVersionTracker {
  public initializeVersions(tasks: TaskModel[]): Record<string, TaskVersionRecord> {
    const versions: Record<string, TaskVersionRecord> = {};

    for (const task of tasks) {
      versions[task.taskId] = {
        taskId: task.taskId,
        version: 1,
        isReplanned: false,
        reason: 'Initial task generation version 1.0',
        timestamp: Date.now()
      };
    }

    return versions;
  }
}
export const taskVersionTracker = new TaskVersionTracker();
