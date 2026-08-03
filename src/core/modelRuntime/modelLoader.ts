import { ModelConfig, ModelState } from './runtimeTypes';
import { runtimeLifecycle } from './runtimeLifecycle';

export class ModelLoader {
  public async load(config: ModelConfig, onProgress?: (state: ModelState) => void): Promise<void> {
    if (onProgress) onProgress(ModelState.Loading);
    runtimeLifecycle.transition(ModelState.Loading, config.modelId);
    
    // Simulate loading latency
    await new Promise(resolve => setTimeout(resolve, 800));

    if (onProgress) onProgress(ModelState.Loaded);
    runtimeLifecycle.transition(ModelState.Loaded, config.modelId);
  }

  public async unload(modelId: string, onProgress?: (state: ModelState) => void): Promise<void> {
    if (onProgress) onProgress(ModelState.Unloading);
    runtimeLifecycle.transition(ModelState.Unloading, modelId);
    
    // Simulate unloading latency
    await new Promise(resolve => setTimeout(resolve, 300));

    if (onProgress) onProgress(ModelState.Registered);
    runtimeLifecycle.transition(ModelState.Registered, modelId);
  }
}

export const modelLoader = new ModelLoader();
