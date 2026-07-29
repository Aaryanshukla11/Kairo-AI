import * as vscode from 'vscode';
import { PermissionEngine } from './permissionEngine';
import { PermissionRequest, PermissionResponse, PermissionAction, PermissionRiskLevel, PermissionPolicy } from './permissionTypes';

export class PermissionService {
  private activeEngine: PermissionEngine | null = null;

  private getEngine(): PermissionEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Permission Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new PermissionEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes to active permissions events.
   */
  public subscribe(listener: any): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public requestPermission(
    action: PermissionAction,
    resource: string,
    riskLevel: PermissionRiskLevel,
    reason: string,
    requestedBy: string,
    operationId?: string
  ): { request?: PermissionRequest; response?: PermissionResponse } {
    return this.getEngine().requestPermission(action, resource, riskLevel, reason, requestedBy, operationId);
  }

  public grantPermission(id: string, approved: boolean, policy?: PermissionPolicy): PermissionResponse {
    return this.getEngine().grantPermission(id, approved, policy);
  }

  public getHistory(): PermissionRequest[] {
    return this.getEngine().getHistory();
  }

  public getRules(): any[] {
    return this.getEngine().getRules();
  }

  public clearSessionRules(): void {
    this.getEngine().clearSessionRules();
  }

  public expireRequests(): void {
    this.getEngine().expireRequests();
  }
}

export const permissionService = new PermissionService();
