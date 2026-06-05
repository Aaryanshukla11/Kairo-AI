import { TaskGraph } from './taskTypes';

export class TaskScheduler {
  public computeSchedule(graph: TaskGraph): { executionOrder: string[]; parallelBranches: string[][] } {
    const inDegree: Record<string, number> = {};
    const taskIds = Object.keys(graph.nodes);

    for (const id of taskIds) {
      inDegree[id] = graph.nodes[id].parents.length;
    }

    const queue: string[] = taskIds.filter(id => inDegree[id] === 0);
    const executionOrder: string[] = [];

    while (queue.length > 0) {
      // Sort queue deterministically by task priority then ID
      queue.sort((a, b) => a.localeCompare(b));
      const curr = queue.shift()!;
      executionOrder.push(curr);

      for (const childId of graph.nodes[curr].children) {
        inDegree[childId]--;
        if (inDegree[childId] === 0) {
          queue.push(childId);
        }
      }
    }

    // Group into parallel branches by node depth
    const depthMap = new Map<number, string[]>();
    for (const id of taskIds) {
      const depth = graph.nodes[id].depth;
      if (!depthMap.has(depth)) {
        depthMap.set(depth, []);
      }
      depthMap.get(depth)!.push(id);
    }

    const maxDepth = Math.max(...Array.from(depthMap.keys()), 0);
    const parallelBranches: string[][] = [];

    for (let d = 0; d <= maxDepth; d++) {
      if (depthMap.has(d)) {
        parallelBranches.push(depthMap.get(d)!);
      }
    }

    return {
      executionOrder,
      parallelBranches
    };
  }
}
export const taskScheduler = new TaskScheduler();
