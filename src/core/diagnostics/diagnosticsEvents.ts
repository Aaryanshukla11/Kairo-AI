import { DiagnosticEvent, DiagnosticEventListener, DiagnosticEventType } from './diagnosticsTypes';

export class DiagnosticsEvents {
  private listeners = new Set<DiagnosticEventListener>();

  /**
   * Subscribes a listener to diagnostics events.
   */
  public subscribe(listener: DiagnosticEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts diagnostics events to all active listeners.
   */
  public emit(type: DiagnosticEventType, diagnosticId: string, payload?: any): void {
    const event: DiagnosticEvent = {
      type,
      diagnosticId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in diagnostics event listener:', err);
      }
    }
  }
}
