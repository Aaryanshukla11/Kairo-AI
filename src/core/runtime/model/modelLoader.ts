import { ModelConfig, ModelState } from './runtimeTypes';

export class ModelLoader {
  /**
   * Simulates loading latency and triggers status updates.
   */
  public async load(config: ModelConfig, onProgress?: (state: ModelState) => void): Promise<void> {
    if (onProgress) onProgress(ModelState.Loading);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (onProgress) onProgress(ModelState.Ready);
  }

  public async unload(onProgress?: (state: ModelState) => void): Promise<void> {
    if (onProgress) onProgress(ModelState.Unloading);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (onProgress) onProgress(ModelState.NotLoaded);
  }
}

export const modelLoader = new ModelLoader();
