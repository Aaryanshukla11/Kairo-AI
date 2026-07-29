import * as vscode from 'vscode';
import { PromptAssemblyEngine } from './promptAssemblyEngine';
import { PromptAssemblyRequest, PromptPackage } from './promptTypes';

export class PromptAssemblyService {
  private activeEngine: PromptAssemblyEngine | null = null;

  private getEngine(): PromptAssemblyEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Prompt Assembly Service: No workspace folder is open');
    }

    if (!this.activeEngine) {
      this.activeEngine = new PromptAssemblyEngine();
    }
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Prompt Assembly changes.
   */
  public subscribe(listener: any): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public assemblePrompt(request: PromptAssemblyRequest): PromptPackage {
    return this.getEngine().assemblePrompt(request);
  }

  public invalidateCache(): void {
    this.getEngine().invalidateCache();
  }
}

export const promptAssemblyService = new PromptAssemblyService();
