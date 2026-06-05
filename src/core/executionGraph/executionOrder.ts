import { ExecutionGraph } from './graphTypes';
import { ExecutionNode } from './node';

export class ExecutionOrderGenerator {
  /**
   * Generates an ordered sequence of execution nodes using topological sort.
   */
  public generateOrder(graph: ExecutionGraph): ExecutionNode[] {
    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of graph.nodes) {
      adjList.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const edge of graph.edges) {
      adjList.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    // Keep queue sorted to make ordering stable and deterministic
    const queue: string[] = [];
    for (const node of graph.nodes) {
      if ((inDegree.get(node.id) || 0) === 0) {
        queue.push(node.id);
      }
    }

    const order: string[] = [];
    while (queue.length > 0) {
      queue.sort();
      const currId = queue.shift()!;
      order.push(currId);

      const neighbors = adjList.get(currId) || [];
      for (const neighbor of neighbors) {
        const nextDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, nextDegree);
        if (nextDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (order.length !== graph.nodes.length) {
      throw new Error('Graph has circular dependencies, order generation failed');
    }

    const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
    return order.map(id => nodeMap.get(id)!);
  }
}

export const executionOrderGenerator = new ExecutionOrderGenerator();
