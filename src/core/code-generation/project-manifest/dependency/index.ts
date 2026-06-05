import { IPlannedFile } from '../schema';

export class FileDependencyAnalyzer {
  public verifyGraph(files: IPlannedFile[]): {
    valid: boolean;
    cycles: string[];
  } {
    const nodes = files.map(f => f.path);
    const nodesSet = new Set(nodes);

    const adj = new Map<string, string[]>();
    for (const n of nodes) {
      adj.set(n, []);
    }

    for (const f of files) {
      for (const d of f.dependencies) {
        if (nodesSet.has(d)) {
          adj.get(f.path)!.push(d);
        }
      }
    }

    const visited = new Set<string>();
    const stack = new Set<string>();
    const cycles: string[] = [];

    const dfs = (node: string): boolean => {
      visited.add(node);
      stack.add(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (stack.has(neighbor)) {
          cycles.push(node, neighbor);
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

    return {
      valid: cycles.length === 0,
      cycles
    };
  }
}

export const fileDependencyAnalyzer = new FileDependencyAnalyzer();
export default fileDependencyAnalyzer;
