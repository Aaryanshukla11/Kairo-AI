export interface DocumentationMetricsData {
  generationCount: number;
  totalUpdatedCount: number;
  warningsCount: number;
  avgCoverage: number;
}

export class DocumentationMetrics {
  private data: DocumentationMetricsData = {
    generationCount: 0,
    totalUpdatedCount: 0,
    warningsCount: 0,
    avgCoverage: 0
  };

  public recordGeneration(updated: number, generated: number, warnings: number, coverage: number): void {
    const totalCoverage = (this.data.avgCoverage * this.data.generationCount) + coverage;
    
    this.data.generationCount += generated;
    this.data.totalUpdatedCount += updated;
    this.data.warningsCount += warnings;
    this.data.avgCoverage = this.data.generationCount > 0 
      ? Math.round(totalCoverage / (this.data.generationCount / generated)) 
      : coverage;
  }

  public getMetrics(): DocumentationMetricsData {
    return this.data;
  }
}

export const documentationMetrics = new DocumentationMetrics();
