export interface ASTMetricsData {
  treesGenerated: number;
  totalNodesCreated: number;
  optimizedNodesCount: number;
}

export class ASTMetrics {
  private data: ASTMetricsData = {
    treesGenerated: 0,
    totalNodesCreated: 0,
    optimizedNodesCount: 0
  };

  public record(nodesCount: number, optimizedCount: number): void {
    this.data.treesGenerated++;
    this.data.totalNodesCreated += nodesCount;
    this.data.optimizedNodesCount += optimizedCount;
  }

  public getMetrics(): ASTMetricsData {
    return this.data;
  }
}

export const astMetrics = new ASTMetrics();
