export interface ArchMetricsData {
  auditsCount: number;
  totalViolationsDetected: number;
  avgTechnicalDebtHours: number;
}

export class ArchitectureMetrics {
  private data: ArchMetricsData = {
    auditsCount: 0,
    totalViolationsDetected: 0,
    avgTechnicalDebtHours: 0
  };

  public recordAudit(violationsCount: number, debtHours: number): void {
    const totalDebt = (this.data.avgTechnicalDebtHours * this.data.auditsCount) + debtHours;

    this.data.auditsCount++;
    this.data.totalViolationsDetected += violationsCount;
    this.data.avgTechnicalDebtHours = Math.round(totalDebt / this.data.auditsCount);
  }

  public getMetrics(): ArchMetricsData {
    return this.data;
  }
}

export const architectureMetrics = new ArchitectureMetrics();
