import { TaskModel, TaskGraph, TaskGraphNode, TaskGraphEdge } from './taskTypes';

export class TaskDependencyResolver {
  public buildTaskGraph(tasks: TaskModel[]): TaskGraph {
    const nodes: Record<string, TaskGraphNode> = {};
    const edges: TaskGraphEdge[] = [];
    const taskMap = new Map<string, TaskModel>();

    for (const task of tasks) {
      taskMap.set(task.taskId, task);
      nodes[task.taskId] = {
        task,
        children: [],
        parents: [...task.dependencies],
        depth: 0,
        inCriticalPath: false
      };
    }

    // Populate children and edges
    for (const task of tasks) {
      for (const parentId of task.dependencies) {
        if (nodes[parentId]) {
          nodes[parentId].children.push(task.taskId);
          edges.push({
            fromTaskId: parentId,
            toTaskId: task.taskId,
            edgeType: 'depends_on'
          });
        }
      }
    }

    // Compute depths via DFS/BFS
    const rootTaskIds = tasks.filter(t => t.dependencies.length === 0).map(t => t.taskId);
    const leafTaskIds = tasks.filter(t => nodes[t.taskId].children.length === 0).map(t => t.taskId);

    const computeDepth = (taskId: string, currentDepth: number) => {
      const node = nodes[taskId];
      if (!node) return;
      node.depth = Math.max(node.depth, currentDepth);
      for (const childId of node.children) {
        computeDepth(childId, currentDepth + 1);
      }
    };

    for (const rootId of rootTaskIds) {
      computeDepth(rootId, 0);
    }

    // Calculate Critical Path (path with maximum total estimated time)
    const memoPath = new Map<string, { duration: number; path: string[] }>();

    const getLongestPathFrom = (taskId: string): { duration: number; path: string[] } => {
      if (memoPath.has(taskId)) {
        return memoPath.get(taskId)!;
      }

      const node = nodes[taskId];
      const taskTime = node.task.estimatedTimeMs;

      if (node.children.length === 0) {
        const res = { duration: taskTime, path: [taskId] };
        memoPath.set(taskId, res);
        return res;
      }

      let maxChildRes = { duration: 0, path: [] as string[] };
      for (const childId of node.children) {
        const childRes = getLongestPathFrom(childId);
        if (childRes.duration > maxChildRes.duration) {
          maxChildRes = childRes;
        }
      }

      const res = {
        duration: taskTime + maxChildRes.duration,
        path: [taskId, ...maxChildRes.path]
      };
      memoPath.set(taskId, res);
      return res;
    };

    let overallMaxPath: string[] = [];
    let overallMaxTime = 0;

    for (const rootId of rootTaskIds) {
      const pathRes = getLongestPathFrom(rootId);
      if (pathRes.duration > overallMaxTime) {
        overallMaxTime = pathRes.duration;
        overallMaxPath = pathRes.path;
      }
    }

    // Mark nodes in critical path
    for (const cpId of overallMaxPath) {
      if (nodes[cpId]) {
        nodes[cpId].inCriticalPath = true;
      }
    }

    const totalEstimatedTimeMs = tasks.reduce((sum, t) => sum + t.estimatedTimeMs, 0);
    const totalEstimatedTokens = tasks.reduce((sum, t) => sum + t.estimatedTokens, 0);

    return {
      nodes,
      edges,
      rootTaskIds,
      leafTaskIds,
      criticalPath: overallMaxPath,
      totalEstimatedTimeMs,
      totalEstimatedTokens
    };
  }
}
export const taskDependencyResolver = new TaskDependencyResolver();
