import * as vscode from 'vscode';
import { RuntimeEngine } from './runtimeEngine';
import { ModelConfig, ModelState, GenerationConfig, InferenceResult } from './runtimeTypes';

export class RuntimeService {
  private activeEngine: RuntimeEngine | null = null;

  private getEngine(): RuntimeEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Model Runtime Service: No workspace folder is open');
    }

    if (!this.activeEngine) {
      this.activeEngine = new RuntimeEngine();
    }
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Model Runtime changes.
   */
  public subscribe(listener: any): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public getModelState(): ModelState {
    return this.getEngine().getModelState();
  }

  public getActiveConfig(): ModelConfig {
    return this.getEngine().getActiveConfig();
  }

  public async loadModel(config: ModelConfig): Promise<void> {
    await this.getEngine().loadModel(config);
  }

  public async unloadModel(): Promise<void> {
    await this.getEngine().unloadModel();
  }

  public async generate(
    promptPkg: any,
    config: GenerationConfig,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<InferenceResult> {
    return this.getEngine().generate(promptPkg, config, onToken, signal);
  }

  public getStats(): any {
    return this.getEngine().getStats();
  }
}

export const runtimeService = new RuntimeService();
