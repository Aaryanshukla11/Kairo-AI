import { ExecutionAuditReport } from './auditTypes';

export class AuditEngine {
  private auditsLog: ExecutionAuditReport[] = [];

  public logExecution(report: Omit<ExecutionAuditReport, 'auditId' | 'timestamp'>): ExecutionAuditReport {
    const fullReport: ExecutionAuditReport = {
      auditId: `AUD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ...report,
      timestamp: Date.now()
    };
    this.auditsLog.push(fullReport);
    return fullReport;
  }

  public getHistory(): ExecutionAuditReport[] {
    return this.auditsLog;
  }

  public clear(): void {
    this.auditsLog = [];
  }
}
export const auditEngine = new AuditEngine();
