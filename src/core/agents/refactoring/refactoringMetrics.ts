export interface RefactorMetricsData {
  analysesCount: number;
  totalSmellsDetected: number;
  avgMaintainabilityScore: number;
}

export class RefactoringMetrics {
  private data: RefactorMetricsData = {
    analysesCount: 0,
    totalSmellsDetected: 0,
    avgMaintainabilityScore: 78
  };

  public recordAnalysis(smellsCount: number, maintainabilityScore: number): void {
    const totalScore = (this.data.avgMaintainabilityScore * this.data.analysesCount) + maintainabilityScore;

    this.data.analysesCount++;
    this.data.totalSmellsDetected += smellsCount;
    this.data.avgMaintainabilityScore = Math.round(totalScore / this.data.analysesCount);
  }

  public getMetrics(): RefactorMetricsData {
    return this.data;
  }
}

export const refactoringMetrics = new RefactoringMetrics();
