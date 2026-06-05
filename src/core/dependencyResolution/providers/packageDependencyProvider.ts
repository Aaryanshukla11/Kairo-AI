import { DependencyNode, DependencyEdge, DependencyResolutionInput } from '../dependencyTypes';

export class PackageDependencyProvider {
  public collect(input: DependencyResolutionInput): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Mock package dependencies
    const packages = ['vscode', 'react', 'react-dom', 'typescript', 'vite', 'jest', 'esbuild'];
    
    for (const pkg of packages) {
      nodes.push({
        id: `package:${pkg}`,
        name: pkg,
        type: 'Package',
        metadata: { packageName: pkg }
      });
    }

    return { nodes, edges };
  }
}

export const packageDependencyProvider = new PackageDependencyProvider();
