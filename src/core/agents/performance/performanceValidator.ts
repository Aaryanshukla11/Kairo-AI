export class PerformanceValidator {
  public validateMetrics(metrics: any): void {
    if (!metrics) {
      throw new Error('Performance validation error: Missing performance metrics input data');
    }
    if (typeof metrics.buildTimeMs !== 'number' || typeof metrics.memoryUsageMb !== 'number') {
      throw new Error('Performance validation error: Incomplete metrics - buildTimeMs or memoryUsageMb is missing or not a number');
    }
  }

  public validateRuntime(runtime: string): void {
    const supportedRuntimes = ['node', 'browser', 'vscode', 'simulated'];
    if (!supportedRuntimes.includes(runtime.toLowerCase())) {
      throw new Error(`Performance validation error: Unsupported runtime environment "${runtime}"`);
    }
  }

  public validateBenchmark(data: any): void {
    if (!data || typeof data.loops !== 'number' || !Array.isArray(data.iterations) || data.iterations.length === 0) {
      throw new Error('Performance validation error: Invalid benchmark data - missing loops count or empty iterations results');
    }
  }
}

export const performanceValidator = new PerformanceValidator();
