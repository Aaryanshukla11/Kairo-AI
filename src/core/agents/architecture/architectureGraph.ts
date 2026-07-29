import { ArchGraphNode, ArchGraphEdge } from './architectureTypes';

export class ArchitectureGraph {
  public buildMockGraph(): { nodes: ArchGraphNode[]; edges: ArchGraphEdge[] } {
    const nodes: ArchGraphNode[] = [
      { name: 'src/webview', layer: 'webview' },
      { name: 'src/extension', layer: 'extension' },
      { name: 'src/core', layer: 'core' },
      { name: 'src/common', layer: 'common' }
    ];

    const edges: ArchGraphEdge[] = [
      { from: 'src/webview', to: 'src/common' },
      { from: 'src/extension', to: 'src/core' },
      { from: 'src/extension', to: 'src/common' },
      { from: 'src/core', to: 'src/common' }
    ];

    return { nodes, edges };
  }
}

export const architectureGraph = new ArchitectureGraph();
 