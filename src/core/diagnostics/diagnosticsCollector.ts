import { randomUUID } from 'crypto';
import { Diagnostic, DiagnosticSeverity, DiagnosticCategory, DiagnosticStatus } from './diagnosticsTypes';

export class DiagnosticsCollector {
  /**
   * Compiles diagnostic properties into validated Diagnostic models.
   */
  public collect(
    sourceModule: string,
    severity: DiagnosticSeverity,
    category: DiagnosticCategory,
    message: string,
    details?: string,
    stackTrace?: string,
    operationId?: string
  ): Diagnostic {
    return {
      id: randomUUID(),
      timestamp: Date.now(),
      sourceModule,
      severity,
      category,
      message,
      details,
      stackTrace,
      operationId,
      status: DiagnosticStatus.Open
    };
  }
}

export const diagnosticsCollector = new DiagnosticsCollector();
