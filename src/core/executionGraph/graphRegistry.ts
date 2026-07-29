import { ExecutionGraph } from './graphTypes';

export class GraphRegistry {
  private graphs = new Map<string, ExecutionGraph>();

  /**
   * Caches an active ExecutionGraph by its planId.
   */
  public register(graph: ExecutionGraph): void {
    this.graphs.set(graph.planId, graph);
  }

  /**
   * Retrieves a cached ExecutionGraph using its planId.
   */
  public getByPlanId(planId: string): ExecutionGraph | undefined {
    return this.graphs.get(planId);
  }

  /**
   * Retrieves a cached ExecutionGraph using its graph id.
   */
  public getById(graphId: string): ExecutionGraph | undefined {
    return Array.from(this.graphs.values()).find(g => g.id === graphId);
  }

  /**
   * Clears the graph cache.
   */
  public clear(): void {
    this.graphs.clear();
  }
}

export const graphRegistry = new GraphRegistry();
