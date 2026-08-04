import * as vscode from 'vscode';
import { RetrieverEngine } from './retrieverEngine';
import { RetrievalRequest, RetrievedContext } from './retrieverTypes';
import { ProjectIndex } from '../indexer/indexTypes';

export class RetrieverService {
  private activeEngine: RetrieverEngine | null = null;

  private getEngine(): RetrieverEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Retriever Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new RetrieverEngine();
    }
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Retriever changes.
   */
  public subscribe(listener: any): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public retrieveContext(request: RetrievalRequest, index: ProjectIndex): RetrievedContext {
    return this.getEngine().retrieveContext(request, index);
  }

  public invalidateCache(): void {
    this.getEngine().invalidateCache();
  }
}

export const retrieverService = new RetrieverService();
