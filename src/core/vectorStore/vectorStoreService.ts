import * as vscode from 'vscode';
import { VectorStoreEngine } from './vectorStoreEngine';
import { VectorRecord, SimilarityResult, SimilarityMetric } from './vectorStoreTypes';
import { VectorStoreProvider } from './providers';
import { VectorStoreStats } from './vectorStoreRegistry';

export class VectorStoreService {
  private activeEngine: VectorStoreEngine | null = null;

  private getEngine(): VectorStoreEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Vector Store Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new VectorStoreEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Vector Store changes.
   */
  public subscribe(listener: any): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public setProvider(provider: VectorStoreProvider): void {
    this.getEngine().setProvider(provider);
  }

  public getProviderName(): string {
    return this.getEngine().getProviderName();
  }

  public insert(record: VectorRecord): void {
    this.getEngine().insert(record);
  }

  public update(record: VectorRecord): void {
    this.getEngine().update(record);
  }

  public delete(id: string): void {
    this.getEngine().delete(id);
  }

  public get(id: string): VectorRecord | null {
    return this.getEngine().get(id);
  }

  public query(filters: Record<string, any>): VectorRecord[] {
    return this.getEngine().query(filters);
  }

  public similaritySearch(queryVector: number[], limit: number, metric: SimilarityMetric): SimilarityResult[] {
    return this.getEngine().similaritySearch(queryVector, limit, metric);
  }

  public clear(): void {
    this.getEngine().clear();
  }

  public getStats(): VectorStoreStats {
    return this.getEngine().getStats();
  }
}

export const vectorStoreService = new VectorStoreService();
