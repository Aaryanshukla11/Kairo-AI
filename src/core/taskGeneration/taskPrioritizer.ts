import { TaskGraph } from './taskTypes';

export class TaskPrioritizer {
  public prioritizeGraph(graph: TaskGraph): void {
    for (const taskId of Object.keys(graph.nodes)) {
      const node = graph.nodes[taskId];
      if (node.inCriticalPath) {
        if (node.task.risk === 'High' || node.task.risk === 'Critical') {
          node.task.priority = 'Critical';
        } else {
          node.task.priority = 'High';
        }
      } else if (node.parents.length === 0) {
        node.task.priority = 'High';
      }
    }
  }
}
export const taskPrioritizer = new TaskPrioritizer();
