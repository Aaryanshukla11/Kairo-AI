import * as vscode from 'vscode';
import { PermissionEngine } from './permissionEngine';
import { PermissionRequest, PermissionResponse, PermissionAction, PermissionRiskLevel, PermissionPolicy } from './permissionTypes';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class PermissionService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: PermissionEngine | null = null;
  private pendingSubscriptions: any[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new PermissionEngine(rootPath);
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

  private getEngine(): PermissionEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes to active permissions events.
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

  public requestPermission(
    action: PermissionAction,
    resource: string,
    riskLevel: PermissionRiskLevel,
    reason: string,
    requestedBy: string,
    operationId?: string
  ): { request?: PermissionRequest; response?: PermissionResponse } {
    const engine = this.getEngine();
    if (!engine) {
      const response: PermissionResponse = {
        requestId: 'none',
        timestamp: Date.now(),
        action,
        resource,
        approved: true, // Default to true if no workspace context exists
        riskLevel
      };
      return { response };
    }
    return engine.requestPermission(action, resource, riskLevel, reason, requestedBy, operationId);
  }

  public grantPermission(id: string, approved: boolean, policy?: PermissionPolicy): PermissionResponse {
    const engine = this.getEngine();
    if (!engine) {
      return {
        requestId: id,
        timestamp: Date.now(),
        action: 'READ' as any,
        resource: '',
        approved,
        riskLevel: 'LOW'
      };
    }
    return engine.grantPermission(id, approved, policy);
  }

  public getHistory(): PermissionRequest[] {
    const engine = this.getEngine();
    if (!engine) return [];
    return engine.getHistory();
  }

  public getRules(): any[] {
    const engine = this.getEngine();
    if (!engine) return [];
    return engine.getRules();
  }

  public clearSessionRules(): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.clearSessionRules();
  }

  public expireRequests(): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.expireRequests();
  }
}

export const permissionService = new PermissionService();
export default permissionService;
