import { EvaluationConfig, MetricResult } from './evaluationTypes';
import {
  tokenizerBenchmarkProvider,
  codingBenchmarkProvider,
  reasoningBenchmarkProvider,
  inferenceBenchmarkProvider,
  customBenchmarkProvider
} from './providers';

export class BenchmarkExecutor {
  public execute(
    benchmark: EvaluationConfig,
    artifact: any,
    dataset: any[]
  ): MetricResult {
    const type = benchmark.type;

    switch (type) {
      case 'tokenizer':
        return tokenizerBenchmarkProvider.execute(artifact, dataset);
      case 'coding':
        return codingBenchmarkProvider.execute(artifact, dataset);
      case 'reasoning':
        return reasoningBenchmarkProvider.execute(artifact, dataset);
      case 'inference':
        return inferenceBenchmarkProvider.execute(artifact, dataset);
      default:
        // custom or fallback scoring logic
        const scoringFn = benchmark.config?.scoringFn || (() => 1.0);
        return customBenchmarkProvider.execute(artifact, dataset, scoringFn);
    }
  }
}

export const benchmarkExecutor = new BenchmarkExecutor();
export default benchmarkExecutor;
