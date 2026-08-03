export class PerformanceAnalyzer {
  public estimatePerformance(modelId: string): { tps: number; latencyMs: number } {
    const id = modelId.toLowerCase();
    if (id.includes('70b')) {
      return { tps: 8.5, latencyMs: 3500 };
    } else if (id.includes('8b') || id.includes('7b')) {
      return { tps: 32.4, latencyMs: 800 };
    }
    return { tps: 45.0, latencyMs: 500 };
  }
}

export const performanceAnalyzer = new PerformanceAnalyzer();
