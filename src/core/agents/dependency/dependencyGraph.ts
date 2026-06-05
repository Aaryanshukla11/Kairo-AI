import { DependencyNode, DependencyEdge } from './dependencyTypes';

export class DependencyGraph {
  public findCycles(edges: DependencyEdge[]): string[][] {
    const adj = new Map<string, string[]>();
    for (const edge of edges) {
      if (!adj.has(edge.from)) adj.set(edge.from, []);
      adj.get(edge.from)!.push(edge.to);
    }

    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string) => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = adj.get(node) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          dfs(next);
        } else if (recStack.has(next)) {
          const cycleStartIdx = path.indexOf(next);
          cycles.push(path.slice(cycleStartIdx).concat(next));
        }
      }

      path.pop();
      recStack.delete(node);
    };

    const allNodes = Array.from(new Set([
      ...edges.map(e => e.from),
      ...edges.map(e => e.to)
    ]));

    for (const node of allNodes) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }
}

export const dependencyGraph = new DependencyGraph();
