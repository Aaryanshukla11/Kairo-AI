export interface DiagnosticEvidence {
  errorName: string;
  message: string;
  language: string;
  runtime: string;
  logs: string[];
}

export class DiagnosticsCollector {
  public collect(raw: any): DiagnosticEvidence {
    return {
      errorName: raw.errorName || 'UnknownError',
      message: raw.message || 'Failure occurred during tool execution',
      language: raw.language || 'typescript',
      runtime: raw.runtime || 'node',
      logs: raw.logs || ['[info] Starting tool execution process...', '[error] Failure triggered.']
    };
  }
}

export const diagnosticsCollector = new DiagnosticsCollector();
