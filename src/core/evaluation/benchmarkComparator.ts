import { EvaluationReportModel } from './evaluationTypes';

export interface ComparisonReport {
  runId1: string;
  runId2: string;
  artifact1: string;
  artifact2: string;
  scoreDifference: number;
  metricDifferences: Array<{
    benchmarkId: string;
    accuracyDiff: number;
    latencyDiffMs: number;
    tokensPerSecDiff: number;
  }>;
}

export class BenchmarkComparator {
  public compareReports(r1: EvaluationReportModel, r2: EvaluationReportModel): ComparisonReport {
    const scoreDifference = parseFloat((r2.aggregatedScore - r1.aggregatedScore).toFixed(2));
    const metricDifferences: any[] = [];

    r1.benchmarkReports.forEach(b1 => {
      const b2 = r2.benchmarkReports.find(x => x.benchmarkId === b1.benchmarkId);
      if (b2) {
        metricDifferences.push({
          benchmarkId: b1.benchmarkId,
          accuracyDiff: parseFloat((b2.metrics.accuracy - b1.metrics.accuracy).toFixed(4)),
          latencyDiffMs: b2.metrics.latencyMs - b1.metrics.latencyMs,
          tokensPerSecDiff: b2.metrics.tokensPerSec - b1.metrics.tokensPerSec
        });
      }
    });

    return {
      runId1: r1.runId,
      runId2: r2.runId,
      artifact1: r1.artifactId,
      artifact2: r2.artifactId,
      scoreDifference,
      metricDifferences
    };
  }
}

export const benchmarkComparator = new BenchmarkComparator();
export default benchmarkComparator;
