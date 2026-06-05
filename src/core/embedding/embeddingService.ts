import * as vscode from 'vscode';
import { EmbeddingEngine } from './embeddingEngine';
import { EmbeddingObject, EmbeddingSourceType } from './embeddingTypes';
import { EmbeddingProvider } from './providers';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class EmbeddingService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: EmbeddingEngine | null = null;
  private pendingSubscriptions: any[] = [];
  private deferredProvider: EmbeddingProvider | null = null;

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new EmbeddingEngine();
    this.state = 'READY';
    if (this.deferredProvider) {
      this.activeEngine.setProvider(this.deferredProvider);
      this.deferredProvider = null;
    }
    for (const listener of this.pendingSubscriptions) {
      this.activeEngine.subscribe(listener);
    }
    this.pendingSubscriptions = [];
  }

  public reset(): void {
    this.activeEngine = null;
    this.state = 'WAITING_FOR_WORKSPACE';
  }

  private getEngine(): EmbeddingEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Embedding changes.
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

  public setProvider(provider: EmbeddingProvider): void {
    const engine = this.getEngine();
    if (!engine) {
      this.deferredProvider = provider;
      return;
    }
    engine.setProvider(provider);
  }

  public getProviderName(): string {
    const engine = this.getEngine();
    if (!engine) {
      return 'None';
    }
    return engine.getProviderName();
  }

  public queueJob(sourceId: string, sourceType: EmbeddingSourceType, content: string): EmbeddingObject {
    const engine = this.getEngine();
    if (!engine) {
      return {
        id: sourceId,
        sourceType,
        contentHash: '',
        vector: [],
        timestamp: Date.now()
      };
    }
    return engine.queueJob(sourceId, sourceType, content);
  }

  public async processQueue(): Promise<void> {
    const engine = this.getEngine();
    if (!engine) return;
    await engine.processQueue();
  }

  public getPendingQueue(): any[] {
    const engine = this.getEngine();
    if (!engine) return [];
    return engine.getPendingQueue();
  }

  public getFailedItems(): Map<string, string> {
    const engine = this.getEngine();
    if (!engine) return new Map();
    return engine.getFailedItems();
  }
}

export const embeddingService = new EmbeddingService();
export default embeddingService;
