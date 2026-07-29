import { ModelConfig, ModelState } from './runtimeTypes';
import { DEFAULT_MODELS } from './runtimeConfig';

export class ModelManager {
  private activeConfig: ModelConfig = DEFAULT_MODELS[0];
  private state: ModelState = ModelState.NotLoaded;

  public getActiveConfig(): ModelConfig {
    return this.activeConfig;
  }

  public setActiveConfig(config: ModelConfig): void {
    this.activeConfig = config;
  }

  public getModelState(): ModelState {
    return this.state;
  }

  public setModelState(state: ModelState): void {
    this.state = state;
  }
}

export const modelManager = new ModelManager();
