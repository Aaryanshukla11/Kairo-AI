export class SymbolGraph {
  public buildGraph(nodes: string[]): { nodes: string[]; edges: { from: string; to: string }[] } {
    const edges: { from: string; to: string }[] = [];
    if (nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({ from: nodes[i], to: nodes[i + 1] });
      }
    }
    return { nodes, edges };
  }
}

export const symbolGraph = new SymbolGraph();
