import { ModelInfo, ModelState } from '../registryTypes';
import { modelMetadataReader } from '../modelMetadata';

export class GgufScanner {
  public scanFile(filePath: string): ModelInfo {
    const meta = modelMetadataReader.extractMetadata(filePath, 'gguf');
    const filename = filePath.split(/[/\\]/).pop() || '';
    const cleanId = filename.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    return {
      modelId: cleanId || 'gguf-model',
      displayName: meta.displayName || 'GGUF Local Model',
      provider: 'gguf',
      architecture: meta.architecture || 'transformer',
      format: 'gguf',
      version: '1.0.0',
      parameters: meta.parameters || '7B',
      quantization: meta.quantization || 'Q4_K_M',
      contextLength: meta.contextLength || 8192,
      tokenizer: meta.tokenizer || 'llama',
      memoryRequirementGb: meta.memoryRequirementGb || 6,
      diskSizeGb: meta.diskSizeGb || 4.5,
      languages: meta.languages || ['en'],
      capabilities: [],
      healthStatus: 'Healthy',
      state: ModelState.Discovered,
      path: filePath
    };
  }
}
