export class BenchmarkManager {
  public executeMockBenchmark(): { loops: number; iterations: number[]; avgTimeMs: number } {
    return {
      loops: 1000,
      iterations: [12, 10, 15, 11, 13],
      avgTimeMs: 12.2
    };
  }
}

export const benchmarkManager = new BenchmarkManager();
