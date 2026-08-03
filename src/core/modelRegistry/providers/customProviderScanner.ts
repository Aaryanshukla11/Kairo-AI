import { ModelInfo, ModelState } from '../registryTypes';

export class CustomProviderScanner {
  public scanCustomManifest(manifestPath: string, content: any): ModelInfo {
    return {
      modelId: content.modelId || 'custom-model-id',
      displayName: content.displayName || 'Custom Provider Model',
      provider: content.provider || 'custom',
      architecture: content.architecture || 'custom-arch',
      format: 'custom',
      version: content.version || '1.0.0',
      parameters: content.parameters || 'unknown',
      quantization: content.quantization || 'none',
      contextLength: content.contextLength || 2048,
      tokenizer: content.tokenizer || 'custom',
      memoryRequirementGb: content.memoryRequirementGb || 4,
      diskSizeGb: content.diskSizeGb || 2.0,
      languages: content.languages || ['en'],
      capabilities: content.capabilities || [],
      healthStatus: 'Healthy',
      state: ModelState.Discovered,
      path: manifestPath
    };
  }
}
