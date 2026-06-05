import { Diagnostic, DiagnosticSeverity, DiagnosticCategory, DiagnosticStatus, DiagnosticEventType } from './diagnosticsTypes';
import { diagnosticsValidator } from './diagnosticsValidator';
import { diagnosticsCollector } from './diagnosticsCollector';
import { diagnosticsRegistry } from './diagnosticsRegistry';
import { DiagnosticsReporter } from './diagnosticsReporter';
import { DiagnosticsEvents } from './diagnosticsEvents';

export class DiagnosticsEngine {
  private events = new DiagnosticsEvents();
  private reporter: DiagnosticsReporter;

  constructor(private workspaceRoot: string) {
    this.reporter = new DiagnosticsReporter(workspaceRoot);
  }

  /**
   * Subscribes to Diagnostics event notifications.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  // --- API ---

  public report(
    sourceModule: string,
    severity: DiagnosticSeverity,
    category: DiagnosticCategory,
    message: string,
    details?: string,
    stackTrace?: string,
    operationId?: string
  ): Diagnostic {
    const diag = diagnosticsCollector.collect(sourceModule, severity, category, message, details, stackTrace, operationId);
    diagnosticsValidator.validate(diag);

    diagnosticsRegistry.register(diag);
    this.reporter.report(diag);

    this.events.emit(DiagnosticEventType.DiagnosticCreated, diag.id, { diagnostic: diag });
    return diag;
  }

  public updateStatus(id: string, status: DiagnosticStatus): void {
    const diag = diagnosticsRegistry.getById(id);
    if (!diag) throw new Error(`Diagnostic not found: ${id}`);

    diag.status = status;
    
    let eventType = DiagnosticEventType.DiagnosticUpdated;
    if (status === DiagnosticStatus.Resolved) eventType = DiagnosticEventType.DiagnosticResolved;
    if (status === DiagnosticStatus.Ignored) eventType = DiagnosticEventType.DiagnosticIgnored;

    this.events.emit(eventType, id, { diagnostic: diag });
  }

  public getFilteredHistory(filters: any): Diagnostic[] {
    return diagnosticsRegistry.getFiltered(filters);
  }

  public getHistory(): Diagnostic[] {
    return diagnosticsRegistry.getHistory();
  }

  public exportJson(): string {
    return diagnosticsRegistry.exportJson();
  }
}
