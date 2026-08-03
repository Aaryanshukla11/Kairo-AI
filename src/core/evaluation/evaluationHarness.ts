import { EvaluationConfig, EvaluationReportModel, EvaluationEventListener, HistoricalMetricEntry } from './evaluationTypes';
import { evaluationEngine } from './evaluationEngine';
import { benchmarkRegistry } from './benchmarkRegistry';
import { evaluationHistory } from './evaluationHistory';
import { benchmarkComparator, ComparisonReport } from './benchmarkComparator';
import { resultExporter } from './resultExporter';
import { evaluationMetrics } from './evaluationMetrics';
import { evaluationEvents } from './evaluationEvents';

export class EvaluationHarness {
  public registerBenchmark(config: EvaluationConfig): void {
    benchmarkRegistry.registerBenchmark(config);
  }

  public async evaluateArtifact(
    artifactId: string,
    artifactType: 'tokenizer' | 'model' | 'checkpoint' | string,
    artifact: any,
    benchmarkIds: string[],
    dataset: any[]
  ): Promise<EvaluationReportModel> {
    return evaluationEngine.evaluate(artifactId, artifactType, artifact, benchmarkIds, dataset);
  }

  public getHistoryLogs() {
    return evaluationMetrics.getHistoryLogs();
  }

  public getLeaderboard(): HistoricalMetricEntry[] {
    return evaluationHistory.getLeaderboard();
  }

  public getRunDetails(runId: string): EvaluationReportModel | undefined {
    return evaluationHistory.getRun(runId);
  }

  public compareRuns(r1: EvaluationReportModel, r2: EvaluationReportModel): ComparisonReport {
    return benchmarkComparator.compareReports(r1, r2);
  }

  public exportReport(report: EvaluationReportModel, format: 'json' | 'csv'): string {
    if (format === 'csv') {
      return resultExporter.exportToCsv(report);
    }
    return resultExporter.exportToJson(report);
  }

  public subscribe(listener: EvaluationEventListener): () => void {
    return evaluationEvents.subscribe(listener);
  }

  public clearHistory(): void {
    benchmarkRegistry.clear();
    evaluationHistory.clear();
    evaluationMetrics.clear();
    evaluationEvents.clear();
  }
}

export const evaluationHarness = new EvaluationHarness();
export default evaluationHarness;
