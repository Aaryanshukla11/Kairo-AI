import { EvaluationConfig } from './evaluationTypes';

export class BenchmarkRegistry {
  private benchmarks = new Map<string, EvaluationConfig>();

  public registerBenchmark(config: EvaluationConfig): void {
    this.benchmarks.set(config.benchmarkId, config);
  }

  public getBenchmark(benchmarkId: string): EvaluationConfig | undefined {
    return this.benchmarks.get(benchmarkId);
  }

  public listBenchmarks(): EvaluationConfig[] {
    return Array.from(this.benchmarks.values());
  }

  public clear(): void {
    this.benchmarks.clear();
  }
}

export const benchmarkRegistry = new BenchmarkRegistry();
export default benchmarkRegistry;
