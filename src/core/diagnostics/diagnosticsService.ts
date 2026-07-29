import * as vscode from 'vscode';
import { DiagnosticsEngine } from './diagnosticsEngine';
import { Diagnostic, DiagnosticSeverity, DiagnosticCategory, DiagnosticStatus } from './diagnosticsTypes';

export class DiagnosticsService {
  private activeEngine: DiagnosticsEngine | null = null;

  private getEngine(): DiagnosticsEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Diagnostics Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new DiagnosticsEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes to active diagnostics updates.
   */
  public subscribe(listener: any): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public report(
    sourceModule: string,
    severity: DiagnosticSeverity,
    category: DiagnosticCategory,
    message: string,
    details?: string,
    stackTrace?: string,
    operationId?: string
  ): Diagnostic {
    return this.getEngine().report(sourceModule, severity, category, message, details, stackTrace, operationId);
  }

  public updateStatus(id: string, status: DiagnosticStatus): void {
    this.getEngine().updateStatus(id, status);
  }

  public getFilteredHistory(filters: any): Diagnostic[] {
    return this.getEngine().getFilteredHistory(filters);
  }

  public getHistory(): Diagnostic[] {
    return this.getEngine().getHistory();
  }

  public exportJson(): string {
    return this.getEngine().exportJson();
  }
}

export const diagnosticsService = new DiagnosticsService();
