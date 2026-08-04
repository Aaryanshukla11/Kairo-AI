import { DependencyNode } from './validationTypes';

export class CircularDependencyDetector {
  public detect(nodes: DependencyNode[]): string[][] {
    const adj = new Map<string, string[]>();
    for (const node of nodes) {
      adj.set(node.id, node.imports);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];
    const path: string[] = [];

    const dfs = (curr: string) => {
      visited.add(curr);
      recStack.add(curr);
      path.push(curr);

      const neighbors = adj.get(curr) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recStack.has(neighbor)) {
          // Cycle detected
          const startIndex = path.indexOf(neighbor);
          if (startIndex !== -1) {
            cycles.push([...path.slice(startIndex), neighbor]);
          }
        }
      }

      path.pop();
      recStack.delete(curr);
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return cycles;
  }
}

export const circularDependencyDetector = new CircularDependencyDetector();
