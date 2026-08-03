import { DependencyGraph, DependencyNode, DependencyEdge, CircularDependencyReport } from './dependencyTypes';

export class DependencyGraphManager {
  public createEmptyGraph(): DependencyGraph {
    return {
      nodes: {},
      edges: {},
      adjacencyList: {}
    };
  }

  public detectCycles(graph: DependencyGraph): CircularDependencyReport {
    const cycles: string[][] = [];
    const visited: Record<string, number> = {}; // 0 = Unvisited, 1 = Visiting, 2 = Visited
    const nodeIds = Object.keys(graph.nodes);

    for (const id of nodeIds) {
      visited[id] = 0;
    }

    const dfs = (nodeId: string, path: string[]) => {
      visited[nodeId] = 1;
      const neighbors = graph.adjacencyList[nodeId] || [];

      for (const neighbor of neighbors) {
        if (visited[neighbor] === 1) {
          // Cycle detected!
          const startIdx = path.indexOf(neighbor);
          if (startIdx !== -1) {
            cycles.push([...path.slice(startIdx), nodeId, neighbor]);
          } else {
            cycles.push([...path, nodeId, neighbor]);
          }
        } else if (visited[neighbor] === 0) {
          dfs(neighbor, [...path, nodeId]);
        }
      }

      visited[nodeId] = 2;
    };

    for (const id of nodeIds) {
      if (visited[id] === 0) {
        dfs(id, []);
      }
    }

    return {
      hasCycles: cycles.length > 0,
      cycles
    };
  }

  public computeTopologicalOrder(graph: DependencyGraph): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        // Cycle detected, stop traversal for topological sort to avoid infinite loop
        return;
      }
      if (!visited.has(nodeId)) {
        temp.add(nodeId);
        const neighbors = graph.adjacencyList[nodeId] || [];
        for (const neighbor of neighbors) {
          visit(neighbor);
        }
        temp.delete(nodeId);
        visited.add(nodeId);
        order.unshift(nodeId);
      }
    };

    const nodeIds = Object.keys(graph.nodes);
    for (const id of nodeIds) {
      visit(id);
    }

    return order;
  }
}

export const dependencyGraphManager = new DependencyGraphManager();
