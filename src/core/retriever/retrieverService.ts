import * as vscode from 'vscode';
import { RetrieverEngine } from './retrieverEngine';
import { RetrievalRequest, RetrievedContext, SearchHit } from './retrieverTypes';
import { ProjectIndex } from '../indexer/indexTypes';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class RetrieverService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: RetrieverEngine | null = null;
  private rootPath: string | null = null;
  private pendingSubscriptions: any[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.rootPath = rootPath;
    this.activeEngine = new RetrieverEngine();
    this.state = 'READY';
    for (const listener of this.pendingSubscriptions) {
      this.activeEngine.subscribe(listener);
    }
    this.pendingSubscriptions = [];
  }

  public reset(): void {
    this.activeEngine = null;
    this.rootPath = null;
    this.state = 'WAITING_FOR_WORKSPACE';
  }

  private getEngine(): RetrieverEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Retriever changes.
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

  public retrieveContext(request: RetrievalRequest, index: ProjectIndex): RetrievedContext {
    const engine = this.getEngine();
    if (!engine) {
      return {
        files: [],
        symbols: [],
        dependencies: [],
        configs: [],
        documentation: [],
        confidenceScore: 0
      };
    }
    return engine.retrieveContext(request, index);
  }

  /**
   * Searches workspace files and symbols returning formatted search hits with code snippets.
   */
  public search(query: string, limit: number = 5, workspacePath?: string): SearchHit[] {
    const engine = this.getEngine();
    if (!engine) {
      console.warn(`[RetrieverService] Cannot execute search: RetrieverEngine is not initialized (state: ${this.state}). Returning empty result.`);
      return [];
    }
    const resolvedPath = workspacePath || this.rootPath;
    if (!resolvedPath) {
      console.warn(`[RetrieverService] Cannot execute search: No active workspace path is known. Returning empty result.`);
      return [];
    }
    return engine.search(query, limit, resolvedPath);
  }

  public invalidateCache(): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.invalidateCache();
  }
}

export const retrieverService = new RetrieverService();
export default retrieverService;
