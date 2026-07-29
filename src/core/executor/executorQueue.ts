import { ExecutionNode } from '../executionGraph/node';

export class ExecutorQueue {
  private queue: ExecutionNode[] = [];

  /**
   * Initializes the queue with a list of nodes in topological order.
   */
  public initialize(nodes: ExecutionNode[]): void {
    this.queue = [...nodes];
  }

  /**
   * Retrieves the next node eligible for execution.
   */
  public getNext(): ExecutionNode | undefined {
    // In sequential execution, we just look for the first node that is Waiting or Ready
    return this.queue.find(node => node.status === 'Waiting' || node.status === 'Ready');
  }

  /**
   * Returns all nodes in the queue.
   */
  public getNodes(): ExecutionNode[] {
    return this.queue;
  }

  /**
   * Clears the execution queue.
   */
  public clear(): void {
    this.queue = [];
  }
}
