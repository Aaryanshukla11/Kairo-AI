import * as vscode from 'vscode';
import { VectorStoreEngine } from './vectorStoreEngine';
import { VectorRecord, SimilarityResult, SimilarityMetric } from './vectorStoreTypes';
import { VectorStoreProvider } from './providers';
import { VectorStoreStats } from './vectorStoreRegistry';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class VectorStoreService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: VectorStoreEngine | null = null;
  private pendingSubscriptions: any[] = [];
  private deferredProvider: VectorStoreProvider | null = null;

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new VectorStoreEngine(rootPath);
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

  private getEngine(): VectorStoreEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Vector Store changes.
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

  public setProvider(provider: VectorStoreProvider): void {
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

  public insert(record: VectorRecord): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.insert(record);
  }

  public update(record: VectorRecord): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.update(record);
  }

  public delete(id: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.delete(id);
  }

  public get(id: string): VectorRecord | null {
    const engine = this.getEngine();
    if (!engine) return null;
    return engine.get(id);
  }

  public query(filters: Record<string, any>): VectorRecord[] {
    const engine = this.getEngine();
    if (!engine) return [];
    return engine.query(filters);
  }

  public similaritySearch(queryVector: number[], limit: number, metric: SimilarityMetric): SimilarityResult[] {
    const engine = this.getEngine();
    if (!engine) return [];
    return engine.similaritySearch(queryVector, limit, metric);
  }

  public clear(): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.clear();
  }

  public getStats(): VectorStoreStats {
    const engine = this.getEngine();
    if (!engine) {
      return {
        storedCount: 0,
        dimensions: 0,
        provider: 'None',
        storageSizeBytes: 0,
        cacheHitRate: 0,
        isReady: false
      };
    }
    return engine.getStats();
  }
}

export const vectorStoreService = new VectorStoreService();
export default vectorStoreService;
