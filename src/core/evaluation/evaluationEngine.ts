import { EvaluationConfig, EvaluationReportModel, EvaluationEventType } from './evaluationTypes';
import { evaluationSuite } from './evaluationSuite';
import { evaluationRunner } from './evaluationRunner';
import { scoreAggregator } from './scoreAggregator';
import { evaluationReports } from './evaluationReports';
import { evaluationHistory } from './evaluationHistory';
import { evaluationValidator } from './evaluationValidator';
import { evaluationMetrics } from './evaluationMetrics';
import { evaluationEvents } from './evaluationEvents';

export class EvaluationEngine {
  public async evaluate(
    artifactId: string,
    artifactType: 'tokenizer' | 'model' | 'checkpoint' | string,
    artifact: any,
    benchmarkIds: string[],
    dataset: any[]
  ): Promise<EvaluationReportModel> {
    const runId = `RUN-${artifactId}-${Date.now()}`;
    evaluationEvents.emit(EvaluationEventType.EvaluationStarted, { runId });

    // 1. Load Artifact
    evaluationEvents.emit(EvaluationEventType.ArtifactLoaded, { artifactId });
    evaluationMetrics.addLog(`Loaded target artifact ${artifactId}.`);

    // 2. Load Benchmark Suite
    const suite = evaluationSuite.createSuite(benchmarkIds);
    evaluationEvents.emit(EvaluationEventType.SuiteLoaded, { count: suite.length });

    // 3. Execute Evaluation & Collect Metrics
    const benchmarkReports = evaluationRunner.runSuite(suite, artifact, dataset);

    // 4. Aggregate Scores
    const aggregatedScore = scoreAggregator.aggregate(benchmarkReports);
    evaluationEvents.emit(EvaluationEventType.ScoresAggregated, { aggregatedScore });

    // 5. Generate Reports & Validate
    const report = evaluationReports.assembleReport(
      runId,
      artifactId,
      artifactType,
      benchmarkReports,
      aggregatedScore
    );

    const validation = evaluationValidator.validateReport(report, suite.length);
    if (!validation.isValid) {
      throw new Error(`Evaluation Validation Error: ${validation.errors.join(', ')}`);
    }
    evaluationEvents.emit(EvaluationEventType.ReportGenerated, { report });

    // 6. Register Results in History logs
    evaluationHistory.logRun(report);
    evaluationEvents.emit(EvaluationEventType.ResultRegistered, { runId });

    evaluationMetrics.addLog(`Completed run ${runId} with score ${aggregatedScore}%`);

    return report;
  }
}

export const evaluationEngine = new EvaluationEngine();
export default evaluationEngine;
