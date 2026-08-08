import * as vscode from 'vscode';
import { DiagnosticsEngine } from './diagnosticsEngine';
import { Diagnostic, DiagnosticSeverity, DiagnosticCategory, DiagnosticStatus } from './diagnosticsTypes';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class DiagnosticsService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: DiagnosticsEngine | null = null;
  private pendingSubscriptions: any[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new DiagnosticsEngine(rootPath);
    this.state = 'READY';
    for (const listener of this.pendingSubscriptions) {
      this.activeEngine.subscribe(listener);
    }
    this.pendingSubscriptions = [];
  }

  public reset(): void {
    this.activeEngine = null;
    this.state = 'WAITING_FOR_WORKSPACE';
  }

  private getEngine(): DiagnosticsEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes to active diagnostics updates.
   */
  public subscribe(listener: any): () => void {
    const engine = this.getEngine();
    if (!engine) {
      this.pendingSubscriptions.push(listener);
      return () => {
        this.pendingSubscriptions = this.pendingSubscriptions.filter(l => l !== listener);
      };
    }
    return engine.subscribe(listener);
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
    const engine = this.getEngine();
    if (!engine) {
      const fallback: Diagnostic = {
        id: `diag-${Date.now()}`,
        timestamp: Date.now(),
        sourceModule,
        severity,
        category,
        message,
        status: DiagnosticStatus.Open
      };
      return fallback;
    }
    return engine.report(sourceModule, severity, category, message, details, stackTrace, operationId);
  }

  public updateStatus(id: string, status: DiagnosticStatus): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.updateStatus(id, status);
  }

  public getFilteredHistory(filters: any): Diagnostic[] {
    const engine = this.getEngine();
    if (!engine) return [];
    return engine.getFilteredHistory(filters);
  }

  public getHistory(): Diagnostic[] {
    const engine = this.getEngine();
    if (!engine) return [];
    return engine.getHistory();
  }

  public exportJson(): string {
    const engine = this.getEngine();
    if (!engine) return '[]';
    return engine.exportJson();
  }
}

export const diagnosticsService = new DiagnosticsService();
export default diagnosticsService;
