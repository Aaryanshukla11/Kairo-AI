export interface LogAuditResult {
  hasCritical: boolean;
  warningsCount: number;
  errorMessages: string[];
}

export class LogAnalyzer {
  public analyze(logs: string[]): LogAuditResult {
    let hasCritical = false;
    let warningsCount = 0;
    const errorMessages: string[] = [];

    for (const log of logs) {
      const lower = log.toLowerCase();
      if (lower.includes('critical') || lower.includes('fatal')) {
        hasCritical = true;
      }
      if (lower.includes('warn') || lower.includes('alert')) {
        warningsCount++;
      }
      if (lower.includes('error') || lower.includes('fail') || lower.includes('exception')) {
        errorMessages.push(log);
      }
    }

    return {
      hasCritical,
      warningsCount,
      errorMessages
    };
  }
}

export const logAnalyzer = new LogAnalyzer();
