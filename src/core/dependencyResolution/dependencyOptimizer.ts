import { DependencyGraph, OptimizationSuggestion } from './dependencyTypes';

export class DependencyOptimizer {
  public optimize(graph: DependencyGraph): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 1. Redundant dependencies detection (direct edge when a transitive path exists)
    // E.g., A -> B, B -> C, and direct A -> C (A -> C is redundant)
    const nodeIds = Object.keys(graph.nodes);
    
    const hasPath = (start: string, end: string, visited: Set<string>): boolean => {
      if (start === end) return true;
      visited.add(start);
      const neighbors = graph.adjacencyList[start] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasPath(neighbor, end, visited)) return true;
        }
      }
      return false;
    };

    for (const u of nodeIds) {
      const neighbors = graph.adjacencyList[u] || [];
      for (const v of neighbors) {
        // Temporarily remove edge u -> v and check if path still exists
        const remainingNeighbors = neighbors.filter(n => n !== v);
        const tempAdjacency = { ...graph.adjacencyList, [u]: remainingNeighbors };
        
        const visited = new Set<string>();
        // Helper inline checking path using tempAdjacency
        const hasPathTemp = (curr: string, dest: string): boolean => {
          if (curr === dest) return true;
          visited.add(curr);
          const nexts = tempAdjacency[curr] || [];
          for (const next of nexts) {
            if (!visited.has(next)) {
              if (hasPathTemp(next, dest)) return true;
            }
          }
          return false;
        };

        if (hasPathTemp(u, v)) {
          suggestions.push({
            id: `opt-redundant-${u}-${v}`,
            type: 'Redundant',
            description: `Direct dependency from "${u}" to "${v}" is redundant as a transitive path exists.`,
            targetNodes: [u, v],
            severity: 'Info'
          });
        }
      }
    }

    // 2. Unused nodes detection (nodes with no incoming or outgoing edges, except if it's the only node)
    if (nodeIds.length > 1) {
      const referencedNodes = new Set<string>();
      for (const edge of Object.values(graph.edges)) {
        referencedNodes.add(edge.source);
        referencedNodes.add(edge.target);
      }

      for (const id of nodeIds) {
        if (!referencedNodes.has(id)) {
          suggestions.push({
            id: `opt-unused-${id}`,
            type: 'Unused',
            description: `Node "${id}" is declared but has no incoming or outgoing dependency links.`,
            targetNodes: [id],
            severity: 'Warning'
          });
        }
      }
    }

    return suggestions;
  }
}

export const dependencyOptimizer = new DependencyOptimizer();
