import { IGenerationTask, ITaskDependencyEdge, ITaskGraph } from '../schema';

export class TaskGraphBuilder {
  public buildGraph(tasks: IGenerationTask[]): ITaskGraph {
    const edges: ITaskDependencyEdge[] = [];
    const taskIds = new Set(tasks.map(t => t.id));

    for (const t of tasks) {
      for (const depId of t.dependencies) {
        if (taskIds.has(depId)) {
          edges.push({ from: depId, to: t.id }); // depId must run BEFORE t.id
        }
      }
    }

    return {
      nodes: tasks,
      edges
    };
  }

  public sortTopologically(graph: ITaskGraph): {
    ordered: IGenerationTask[];
    cycles: string[];
  } {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const node of graph.nodes) {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    }

    for (const edge of graph.edges) {
      adj.get(edge.from)!.push(edge.to);
      inDegree.set(edge.to, inDegree.get(edge.to)! + 1);
    }

    const queue: string[] = [];
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    const orderedIds: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      orderedIds.push(u);

      const neighbors = adj.get(u) || [];
      for (const v of neighbors) {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    const orderedTasks = orderedIds
      .map(id => graph.nodes.find(n => n.id === id)!)
      .filter(Boolean);

    const cycles: string[] = [];
    if (orderedTasks.length < graph.nodes.length) {
      // Cylces detected
      for (const node of graph.nodes) {
        if (!orderedIds.includes(node.id)) {
          cycles.push(node.id);
        }
      }
    }

    return {
      ordered: orderedTasks,
      cycles
    };
  }
}

export const taskGraphBuilder = new TaskGraphBuilder();
export default taskGraphBuilder;
