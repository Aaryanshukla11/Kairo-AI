export interface SecurityMetricsData {
  scansCount: number;
  blockedCount: number;
  warningsCount: number;
  approvalsCount: number;
  totalIssuesCount: number;
}

export class SecurityMetrics {
  private data: SecurityMetricsData = {
    scansCount: 0,
    blockedCount: 0,
    warningsCount: 0,
    approvalsCount: 0,
    totalIssuesCount: 0
  };

  public recordScan(issuesCount: number, decision: string): void {
    this.data.scansCount++;
    this.data.totalIssuesCount += issuesCount;

    if (decision === 'Block') {
      this.data.blockedCount++;
    } else if (decision === 'Warn') {
      this.data.warningsCount++;
    } else if (decision === 'Require Approval') {
      this.data.approvalsCount++;
    }
  }

  public getMetrics(): SecurityMetricsData {
    return this.data;
  }
}

export const securityMetrics = new SecurityMetrics();
