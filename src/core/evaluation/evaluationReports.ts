import { EvaluationReportModel, BenchmarkReport } from './evaluationTypes';

export class EvaluationReports {
  public assembleReport(
    runId: string,
    artifactId: string,
    artifactType: string,
    benchmarkReports: BenchmarkReport[],
    aggregatedScore: number
  ): EvaluationReportModel {
    return {
      runId,
      artifactId,
      artifactType,
      timestamp: Date.now(),
      benchmarkReports,
      aggregatedScore,
      metadata: {
        evaluatorVersion: '1.0.0',
        environment: 'Kairo-AI Evaluation Sandbox'
      }
    };
  }
}

export const evaluationReports = new EvaluationReports();
export default evaluationReports;
