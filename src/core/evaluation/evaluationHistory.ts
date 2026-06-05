import { HistoricalMetricEntry, EvaluationReportModel } from './evaluationTypes';

export class EvaluationHistory {
  private historyList: HistoricalMetricEntry[] = [];
  private runRegistry = new Map<string, EvaluationReportModel>();

  public logRun(report: EvaluationReportModel): void {
    this.runRegistry.set(report.runId, report);
    this.historyList.push({
      timestamp: report.timestamp,
      runId: report.runId,
      artifactId: report.artifactId,
      aggregatedScore: report.aggregatedScore
    });
  }

  public getLeaderboard(): HistoricalMetricEntry[] {
    // Sort scores descending for leaderboard standings
    return [...this.historyList].sort((a, b) => b.aggregatedScore - a.aggregatedScore);
  }

  public getHistory(): HistoricalMetricEntry[] {
    return [...this.historyList];
  }

  public getRun(runId: string): EvaluationReportModel | undefined {
    return this.runRegistry.get(runId);
  }

  public clear(): void {
    this.historyList = [];
    this.runRegistry.clear();
  }
}

export const evaluationHistory = new EvaluationHistory();
export default evaluationHistory;
