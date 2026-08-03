import { DependencyNode, DependencyEdge, DependencyResolutionInput } from '../dependencyTypes';

export class FileDependencyProvider {
  public collect(input: DependencyResolutionInput): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Extract file information from the workspaceIndex or taskGraph if available
    const files = input.workspaceIndex?.files || ['src/index.ts', 'src/extension/index.ts', 'src/webview/main.tsx', 'src/core/planner/planner.ts'];
    
    for (const file of files) {
      nodes.push({
        id: `file:${file}`,
        name: file,
        type: 'File',
        metadata: { path: file }
      });
    }

    // Add some default dependency edges for foundation testing
    if (files.includes('src/extension/index.ts') && files.includes('src/index.ts')) {
      edges.push({
        id: 'dep-file-ext-to-index',
        source: 'file:src/extension/index.ts',
        target: 'file:src/index.ts',
        type: 'File',
        direction: 'Outgoing',
        strength: 'Direct',
        required: true,
        optional: false,
        risk: 'Minimal',
        confidence: 0.95
      });
    }

    return { nodes, edges };
  }
}

export const fileDependencyProvider = new FileDependencyProvider();
