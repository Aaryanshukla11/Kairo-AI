import { ModelInfo, ModelState } from '../registryTypes';
import { modelMetadataReader } from '../modelMetadata';

export class MlxScanner {
  public scanFolder(folderPath: string): ModelInfo {
    const meta = modelMetadataReader.extractMetadata(folderPath, 'mlx');
    const foldername = folderPath.split(/[/\\]/).pop() || '';
    const cleanId = foldername.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    return {
      modelId: cleanId || 'mlx-model',
      displayName: meta.displayName || 'MLX Apple Silicon Model',
      provider: 'mlx',
      architecture: meta.architecture || 'transformer',
      format: 'mlx',
      version: '1.0.0',
      parameters: meta.parameters || '7B',
      quantization: meta.quantization || 'MLX_4BIT',
      contextLength: meta.contextLength || 8192,
      tokenizer: meta.tokenizer || 'mlx',
      memoryRequirementGb: meta.memoryRequirementGb || 8,
      diskSizeGb: meta.diskSizeGb || 4.2,
      languages: meta.languages || ['en'],
      capabilities: [],
      healthStatus: 'Healthy',
      state: ModelState.Discovered,
      path: folderPath
    };
  }
}
