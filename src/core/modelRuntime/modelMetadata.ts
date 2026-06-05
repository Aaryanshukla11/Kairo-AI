import { ModelConfig } from './runtimeTypes';

export interface ModelDetails extends ModelConfig {
  architecture?: string;
  quantization?: string;
  author?: string;
  license?: string;
  sha256?: string;
}

export class ModelMetadataParser {
  public parseGgufMetadata(filePath: string): Partial<ModelDetails> {
    // Simulated parsing of GGUF metadata header
    return {
      architecture: 'llama',
      quantization: 'Q4_K_M',
      author: 'Meta',
      license: 'llama3',
      sha256: 'mock-sha256-hash-gguf-value'
    };
  }

  public getModelDetails(config: ModelConfig): ModelDetails {
    const details = config.provider === 'gguf' ? this.parseGgufMetadata(config.path || '') : {};
    return {
      ...config,
      architecture: 'transformer',
      quantization: 'none',
      author: 'community',
      ...details
    };
  }
}

export const modelMetadataParser = new ModelMetadataParser();
