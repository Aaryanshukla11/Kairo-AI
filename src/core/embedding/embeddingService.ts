import * as vscode from 'vscode';
import { EmbeddingEngine } from './embeddingEngine';
import { EmbeddingObject, EmbeddingSourceType } from './embeddingTypes';
import { EmbeddingProvider } from './providers';

export class EmbeddingService {
  private activeEngine: EmbeddingEngine | null = null;

  private getEngine(): EmbeddingEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Embedding Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new EmbeddingEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Embedding changes.
   */
  public subscribe(listener: any): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public setProvider(provider: EmbeddingProvider): void {
    this.getEngine().setProvider(provider);
  }

  public getProviderName(): string {
    return this.getEngine().getProviderName();
  }

  public queueJob(sourceId: string, sourceType: EmbeddingSourceType, content: string): EmbeddingObject {
    return this.getEngine().queueJob(sourceId, sourceType, content);
  }

  public async processQueue(): Promise<void> {
    await this.getEngine().processQueue();
  }

  public getPendingQueue(): any[] {
    return this.getEngine().getPendingQueue();
  }

  public getFailedItems(): Map<string, string> {
    return this.getEngine().getFailedItems();
  }
}

export const embeddingService = new EmbeddingService();
