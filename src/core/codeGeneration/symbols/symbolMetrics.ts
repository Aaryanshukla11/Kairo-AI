export interface SymbolMetricsData {
  totalResolutions: number;
  totalUnresolved: number;
}

export class SymbolMetrics {
  private data: SymbolMetricsData = {
    totalResolutions: 0,
    totalUnresolved: 0
  };

  public record(unresolvedCount: number): void {
    this.data.totalResolutions++;
    this.data.totalUnresolved += unresolvedCount;
  }

  public getMetrics(): SymbolMetricsData {
    return this.data;
  }
}

export const symbolMetrics = new SymbolMetrics();
