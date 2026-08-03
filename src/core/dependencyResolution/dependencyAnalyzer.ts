import { DependencyNode, DependencyEdge, DependencyResolutionInput } from './dependencyTypes';
import {
  fileDependencyProvider,
  symbolDependencyProvider,
  importDependencyProvider,
  apiDependencyProvider,
  databaseDependencyProvider,
  configurationDependencyProvider,
  packageDependencyProvider
} from './providers';

export class DependencyAnalyzer {
  public collectRawDependencies(input: DependencyResolutionInput): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
    let allNodes: DependencyNode[] = [];
    let allEdges: DependencyEdge[] = [];

    const providers = [
      fileDependencyProvider,
      symbolDependencyProvider,
      importDependencyProvider,
      apiDependencyProvider,
      databaseDependencyProvider,
      configurationDependencyProvider,
      packageDependencyProvider
    ];

    for (const provider of providers) {
      try {
        const { nodes, edges } = provider.collect(input);
        allNodes = allNodes.concat(nodes);
        allEdges = allEdges.concat(edges);
      } catch (err) {
        console.error('[DependencyAnalyzer] Error collecting from provider:', err);
      }
    }

    return {
      nodes: allNodes,
      edges: allEdges
    };
  }
}

export const dependencyAnalyzer = new DependencyAnalyzer();
