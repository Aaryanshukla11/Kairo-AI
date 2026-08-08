import { IModuleMetadata, IDependencyEdge } from '../schema';

export class DependencyGraphBuilder {
  public buildGraph(modules: IModuleMetadata[]): {
    nodes: string[];
    edges: IDependencyEdge[];
  } {
    const nodes = modules.map(m => m.name);
    const edges: IDependencyEdge[] = [];

    const nodesSet = new Set(nodes);

    for (const m of modules) {
      for (const d of m.dependencies) {
        if (nodesSet.has(d)) {
          edges.push({ from: m.name, to: d });
        }
      }
    }

    return {
      nodes,
      edges
    };
  }

  public detectCycles(nodes: string[], edges: IDependencyEdge[]): string[] {
    const adj = new Map<string, string[]>();
    for (const n of nodes) {
      adj.set(n, []);
    }
    for (const e of edges) {
      adj.get(e.from)!.push(e.to);
    }

    const visited = new Set<string>();
    const stack = new Set<string>();
    const cycleNodes: string[] = [];

    const dfs = (node: string): boolean => {
      visited.add(node);
      stack.add(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (stack.has(neighbor)) {
          cycleNodes.push(node, neighbor);
          return true;
        }
      }

      stack.delete(node);
      return false;
    };

    for (const n of nodes) {
      if (!visited.has(n)) {
        if (dfs(n)) break;
      }
    }

    return cycleNodes;
  }
}

export const dependencyGraphBuilder = new DependencyGraphBuilder();
export default dependencyGraphBuilder;
