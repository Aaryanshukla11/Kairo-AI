import { ExecutionGraph } from './graphTypes';

export class GraphValidator {
  /**
   * Validates the execution graph structure.
   */
  public validate(graph: ExecutionGraph): void {
    if (!graph.nodes || graph.nodes.length === 0) {
      throw new Error('Graph validation failed: Empty graph');
    }

    // Check duplicate Node IDs
    const nodeIds = new Set<string>();
    for (const node of graph.nodes) {
      if (nodeIds.has(node.id)) {
        throw new Error(`Graph validation failed: Duplicate Node ID "${node.id}"`);
      }
      nodeIds.add(node.id);
    }

    // Check invalid Edges (referencing missing node IDs)
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.source)) {
        throw new Error(`Graph validation failed: Edge source "${edge.source}" does not exist in nodes`);
      }
      if (!nodeIds.has(edge.target)) {
        throw new Error(`Graph validation failed: Edge target "${edge.target}" does not exist in nodes`);
      }
    }

    // Check circular dependencies
    this.detectCycles(graph);
  }

  /**
   * Detects cycles in the directed dependency graph using DFS.
   */
  private detectCycles(graph: ExecutionGraph): void {
    const adjList = new Map<string, string[]>();
    for (const node of graph.nodes) {
      adjList.set(node.id, []);
    }
    
    // Edges represent dependencies: source must run before target
    for (const edge of graph.edges) {
      adjList.get(edge.source)!.push(edge.target);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) {
        return true; // Cycle detected
      }
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          throw new Error('Graph validation failed: Circular dependencies detected');
        }
      }
    }
  }
}

export const graphValidator = new GraphValidator();
