import { Diagnostic, DiagnosticSeverity, DiagnosticCategory } from './diagnosticsTypes';

export class DiagnosticsRegistry {
  private diagnostics: Diagnostic[] = [];

  /**
   * Registers a diagnostic entry, checking duplicate ID and metadata conditions.
   */
  public register(diagnostic: Diagnostic): void {
    const isDuplicate = this.diagnostics.some(
      d => d.id === diagnostic.id || 
      (d.sourceModule === diagnostic.sourceModule && 
       d.message === diagnostic.message && 
       Math.abs(d.timestamp - diagnostic.timestamp) < 100)
    );
    
    if (isDuplicate) return;

    this.diagnostics.push(diagnostic);
  }

  public getById(id: string): Diagnostic | undefined {
    return this.diagnostics.find(d => d.id === id);
  }

  /**
   * Filters and sorts registered diagnostics logs.
   */
  public getFiltered(filters: {
    severity?: DiagnosticSeverity;
    category?: DiagnosticCategory;
    sourceModule?: string;
    search?: string;
    sortBy?: 'timestamp' | 'severity';
    sortOrder?: 'asc' | 'desc';
  }): Diagnostic[] {
    let list = [...this.diagnostics];

    if (filters.severity) {
      list = list.filter(d => d.severity === filters.severity);
    }
    if (filters.category) {
      list = list.filter(d => d.category === filters.category);
    }
    if (filters.sourceModule) {
      list = list.filter(d => d.sourceModule.toLowerCase() === filters.sourceModule!.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(d => d.message.toLowerCase().includes(q) || (d.details && d.details.toLowerCase().includes(q)));
    }

    const order = filters.sortOrder === 'desc' ? -1 : 1;
    list.sort((a, b) => {
      if (filters.sortBy === 'severity') {
        const severities = Object.values(DiagnosticSeverity);
        return (severities.indexOf(a.severity) - severities.indexOf(b.severity)) * order;
      }
      return (a.timestamp - b.timestamp) * order;
    });

    return list;
  }

  public getHistory(): Diagnostic[] {
    return [...this.diagnostics];
  }

  /**
   * Exports cache logs into JSON string formats.
   */
  public exportJson(): string {
    return JSON.stringify(this.diagnostics, null, 2);
  }

  public clear(): void {
    this.diagnostics = [];
  }
}

export const diagnosticsRegistry = new DiagnosticsRegistry();
