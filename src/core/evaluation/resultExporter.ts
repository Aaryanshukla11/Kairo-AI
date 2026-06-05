import { EvaluationReportModel } from './evaluationTypes';

export class ResultExporter {
  public exportToJson(report: EvaluationReportModel): string {
    return JSON.stringify(report, null, 2);
  }

  public exportToCsv(report: EvaluationReportModel): string {
    const lines = ['Benchmark ID,Name,Accuracy,Latency (ms),Tokens/sec,Status'];
    report.benchmarkReports.forEach(b => {
      lines.push(`${b.benchmarkId},"${b.name}",${b.metrics.accuracy},${b.metrics.latencyMs},${b.metrics.tokensPerSec},${b.status}`);
    });
    return lines.join('\n');
  }
}

export const resultExporter = new ResultExporter();
export default resultExporter;
