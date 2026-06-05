import { EvaluationReportModel, BenchmarkReport } from './evaluationTypes';

export class EvaluationValidator {
  public validateReport(report: EvaluationReportModel, expectedBenchmarkCount: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Artifact valid check
    if (!report.artifactId) {
      errors.push('Validation Error: Artifact ID is missing.');
    }

    // 2. Metrics complete check
    if (report.benchmarkReports.length === 0) {
      errors.push('Validation Error: Benchmark reports list is empty.');
    } else {
      report.benchmarkReports.forEach(b => {
        const m = b.metrics;
        if (m.accuracy === undefined || m.latencyMs === undefined || m.tokensPerSec === undefined) {
          errors.push(`Validation Error: Incomplete metrics in benchmark ${b.benchmarkId}`);
        }
        
        // 3. Stable execution checks
        if (m.failureRate > 0.10) {
          errors.push(`Stability warning: High failure rate [${(m.failureRate * 100).toFixed(1)}%] in benchmark ${b.benchmarkId}`);
        }
      });
    }

    // 4. No missing benchmark check
    if (report.benchmarkReports.length < expectedBenchmarkCount) {
      errors.push(`Validation Error: Evaluated benchmark count (${report.benchmarkReports.length}) is below expected count (${expectedBenchmarkCount}).`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const evaluationValidator = new EvaluationValidator();
export default evaluationValidator;
