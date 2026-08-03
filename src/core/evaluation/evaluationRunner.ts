import { EvaluationConfig, BenchmarkReport, EvaluationEventType } from './evaluationTypes';
import { benchmarkExecutor } from './benchmarkExecutor';
import { evaluationEvents } from './evaluationEvents';

export class EvaluationRunner {
  public runSuite(
    suite: EvaluationConfig[],
    artifact: any,
    dataset: any[]
  ): BenchmarkReport[] {
    const reports: BenchmarkReport[] = [];

    suite.forEach(config => {
      evaluationEvents.emit(EvaluationEventType.BenchmarkStarted, { benchmarkId: config.benchmarkId });
      
      const logs: string[] = [`Starting execution of benchmark ${config.benchmarkId}`];
      
      try {
        const metrics = benchmarkExecutor.execute(config, artifact, dataset);
        logs.push(`Successfully completed benchmark ${config.benchmarkId}. Accuracy: ${metrics.accuracy}`);
        
        reports.push({
          benchmarkId: config.benchmarkId,
          name: config.name,
          metrics,
          timestamp: Date.now(),
          status: 'passed',
          logs
        });
      } catch (err: any) {
        logs.push(`Error executing benchmark: ${err.message}`);
        reports.push({
          benchmarkId: config.benchmarkId,
          name: config.name,
          metrics: {
            accuracy: 0.0,
            passRate: 0.0,
            successRate: 0.0,
            latencyMs: 0,
            tokensPerSec: 0,
            memoryUsageBytes: 0,
            contextEfficiency: 0.0,
            failureRate: 1.0,
            inferenceTimeMs: 0.0,
            benchmarkCoverage: 0.0
          },
          timestamp: Date.now(),
          status: 'failed',
          logs
        });
      }

      evaluationEvents.emit(EvaluationEventType.BenchmarkCompleted, { benchmarkId: config.benchmarkId });
    });

    return reports;
  }
}

export const evaluationRunner = new EvaluationRunner();
export default evaluationRunner;
