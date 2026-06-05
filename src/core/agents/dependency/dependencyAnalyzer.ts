import { DependencyNode, DependencyEdge } from './dependencyTypes';

export class DependencyAnalyzer {
  public parseManifest(manifest: any): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Add root node
    const rootName = manifest.name || 'sasta-antigravity';
    nodes.push({ name: rootName, version: manifest.version || '1.0.0', isDev: false });

    const deps = manifest.dependencies || {};
    const devDeps = manifest.devDependencies || {};

    for (const [pkg, ver] of Object.entries(deps)) {
      nodes.push({ name: pkg, version: ver as string, isDev: false });
      edges.push({ from: rootName, to: pkg, type: 'dependency' });
    }

    for (const [pkg, ver] of Object.entries(devDeps)) {
      nodes.push({ name: pkg, version: ver as string, isDev: true });
      edges.push({ from: rootName, to: pkg, type: 'devDependency' });
    }

    return { nodes, edges };
  }
}

export const dependencyAnalyzer = new DependencyAnalyzer();
