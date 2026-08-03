import { DependencyNode, DependencyEdge, DependencyGraph } from './dependencyTypes';
import { dependencyClassifier } from './dependencyClassifier';

export class DependencyResolver {
  public resolveGraph(nodes: DependencyNode[], edges: DependencyEdge[]): DependencyGraph {
    const graphNodes: Record<string, DependencyNode> = {};
    const graphEdges: Record<string, DependencyEdge> = {};
    const adjacencyList: Record<string, string[]> = {};

    // 1. De-duplicate nodes
    for (const node of nodes) {
      if (!graphNodes[node.id]) {
        graphNodes[node.id] = node;
        adjacencyList[node.id] = [];
      }
    }

    // 2. Classify, de-duplicate and load edges
    for (const rawEdge of edges) {
      const edge = dependencyClassifier.classifyEdge(rawEdge);
      if (!graphEdges[edge.id]) {
        graphEdges[edge.id] = edge;

        // Ensure nodes exist in graph (safe-guard)
        if (!graphNodes[edge.source]) {
          graphNodes[edge.source] = { id: edge.source, name: edge.source, type: edge.type };
          adjacencyList[edge.source] = [];
        }
        if (!graphNodes[edge.target]) {
          graphNodes[edge.target] = { id: edge.target, name: edge.target, type: edge.type };
          adjacencyList[edge.target] = [];
        }

        // Add to adjacency list (source depends on target / target executes first, so direction outgoing goes source -> target)
        if (!adjacencyList[edge.source].includes(edge.target)) {
          adjacencyList[edge.source].push(edge.target);
        }
      }
    }

    return {
      nodes: graphNodes,
      edges: graphEdges,
      adjacencyList
    };
  }
}

export const dependencyResolver = new DependencyResolver();
