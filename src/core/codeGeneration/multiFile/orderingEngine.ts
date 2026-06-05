import { GenerationGraph } from './generationGraph';
import { FileOperation } from './generationTypes';

export class OrderingEngine {
  public computeOrder(ops: FileOperation[]): string[] {
    const graph = new GenerationGraph();
    for (const op of ops) {
      graph.addNode(op.filePath);
    }

    for (const op of ops) {
      for (const dep of op.dependencies) {
        graph.addNode(dep);
        graph.addEdge(dep, op.filePath);
      }
    }

    const visited = new Map<string, 'VISITING' | 'VISITED'>();
    const order: string[] = [];

    const visit = (node: string) => {
      const state = visited.get(node);
      if (state === 'VISITING') {
        throw new Error(`Multi-file consistency validation error: Circular dependency generation order cycle detected at node "${node}"`);
      }
      if (state === 'VISITED') {
        return;
      }

      visited.set(node, 'VISITING');
      for (const adj of graph.getAdjacentNodes(node)) {
        visit(adj);
      }
      visited.set(node, 'VISITED');
      order.unshift(node);
    };

    for (const node of graph.getAllNodes()) {
      if (!visited.has(node)) {
        visit(node);
      }
    }

    return order.reverse();
  }
}

export const orderingEngine = new OrderingEngine();
