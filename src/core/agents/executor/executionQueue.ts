import { PlannerTaskItem } from '../planner/plannerTypes';

export class ExecutionQueue {
  private queue: PlannerTaskItem[] = [];

  public setQueue(tasks: PlannerTaskItem[]): void {
    this.queue = [...tasks];
  }

  /**
   * Resolves the next task where all dependencies have been resolved/removed from queue.
   */
  public next(): PlannerTaskItem | undefined {
    return this.queue.find(t => !t.dependencies.some(depId => this.queue.some(q => q.id === depId)));
  }

  public dequeue(taskId: string): void {
    this.queue = this.queue.filter(t => t.id !== taskId);
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public getRemaining(): PlannerTaskItem[] {
    return this.queue;
  }
}
