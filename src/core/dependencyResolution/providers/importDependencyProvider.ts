import { DependencyNode, DependencyEdge, DependencyResolutionInput } from '../dependencyTypes';

export class ImportDependencyProvider {
  public collect(input: DependencyResolutionInput): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Extract import dependencies from importGraph or generate defaults
    const imports = input.importGraph?.imports || ['react', 'vscode', 'esbuild', 'vite'];
    
    for (const imp of imports) {
      nodes.push({
        id: `import:${imp}`,
        name: imp,
        type: 'Import',
        metadata: { importName: imp }
      });
    }

    return { nodes, edges };
  }
}

export const importDependencyProvider = new ImportDependencyProvider();
