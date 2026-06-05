import { DependencyNode, DependencyEdge, DependencyResolutionInput } from '../dependencyTypes';

export class SymbolDependencyProvider {
  public collect(input: DependencyResolutionInput): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Extract symbol mappings from symbolGraph or mock default symbols
    const symbols = input.symbolGraph?.symbols || ['plannerEngine', 'taskBuilder', 'taskValidator', 'executionPlanningEngine'];
    
    for (const sym of symbols) {
      nodes.push({
        id: `symbol:${sym}`,
        name: sym,
        type: 'Symbol',
        metadata: { symbol: sym }
      });
    }

    if (symbols.includes('plannerEngine') && symbols.includes('taskBuilder')) {
      edges.push({
        id: 'dep-sym-builder-to-planner',
        source: 'symbol:taskBuilder',
        target: 'symbol:plannerEngine',
        type: 'Symbol',
        direction: 'Outgoing',
        strength: 'Direct',
        required: true,
        optional: false,
        risk: 'Minimal',
        confidence: 0.9
      });
    }

    return { nodes, edges };
  }
}

export const symbolDependencyProvider = new SymbolDependencyProvider();
