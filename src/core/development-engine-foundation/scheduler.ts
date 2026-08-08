export class GeneratorScheduler {
  public determineExecutionQueue(tasks: readonly any[]): string[] {
    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();
    const taskMap = new Map<string, any>();

    for (const task of tasks) {
      taskMap.set(task.taskId, task);
      inDegree.set(task.taskId, 0);
      adj.set(task.taskId, []);
    }

    // Build dependency graph (note: task.dependencies are lists of taskId that this task depends on)
    // Therefore: Prerequisite -> Task
    for (const task of tasks) {
      for (const dep of task.dependencies) {
        if (!taskMap.has(dep)) {
          throw new Error(`Task dependency referencing non-existent taskId: '${dep}' in task '${task.taskId}'`);
        }
        const neighbors = adj.get(dep) || [];
        neighbors.push(task.taskId);
        adj.set(dep, neighbors);
        
        inDegree.set(task.taskId, (inDegree.get(task.taskId) || 0) + 1);
      }
    }

    // Kahn's algorithm topological sort
    const queue: string[] = [];
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    // To respect phase/priority weights, sort initial zero indegrees by executionOrder
    queue.sort((a, b) => (taskMap.get(a)?.executionOrder || 0) - (taskMap.get(b)?.executionOrder || 0));

    const result: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      result.push(u);

      const neighbors = adj.get(u) || [];
      for (const v of neighbors) {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
      // Re-sort queue to maintain executionOrder preferences for ready items
      queue.sort((a, b) => (taskMap.get(a)?.executionOrder || 0) - (taskMap.get(b)?.executionOrder || 0));
    }

    if (result.length !== tasks.length) {
      throw new Error('Circular dependency detected in tasks graph. Execution scheduler halted.');
    }

    return result;
  }
}

export const generatorScheduler = new GeneratorScheduler();
export default generatorScheduler;
