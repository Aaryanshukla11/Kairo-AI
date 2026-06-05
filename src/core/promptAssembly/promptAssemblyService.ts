import * as vscode from 'vscode';
import { PromptAssemblyEngine } from './promptAssemblyEngine';
import { PromptAssemblyRequest, PromptPackage } from './promptTypes';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class PromptAssemblyService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: PromptAssemblyEngine | null = null;
  private pendingSubscriptions: any[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new PromptAssemblyEngine();
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

  private getEngine(): PromptAssemblyEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Prompt Assembly changes.
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

  public assemblePrompt(request: PromptAssemblyRequest): PromptPackage {
    const engine = this.getEngine();
    if (!engine) {
      return {
        prompt: request.userPrompt,
        systemPrompt: '',
        context: '',
        metadata: { timestamp: Date.now() }
      };
    }
    return engine.assemblePrompt(request);
  }

  public invalidateCache(): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.invalidateCache();
  }
}

export const promptAssemblyService = new PromptAssemblyService();
export default promptAssemblyService;
