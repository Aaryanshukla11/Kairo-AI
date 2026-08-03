import { EvaluationConfig } from './evaluationTypes';
import { benchmarkRegistry } from './benchmarkRegistry';

export class EvaluationSuite {
  public createSuite(benchmarkIds: string[]): EvaluationConfig[] {
    const list: EvaluationConfig[] = [];
    benchmarkIds.forEach(id => {
      const config = benchmarkRegistry.getBenchmark(id);
      if (config) {
        list.push(config);
      }
    });
    return list;
  }
}

export const evaluationSuite = new EvaluationSuite();
export default evaluationSuite;
