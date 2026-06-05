import { ModelInfo, ModelState } from './registryTypes';

export class ModelMetadataReader {
  public extractMetadata(filePath: string, format: string): Partial<ModelInfo> {
    const filename = filePath.split(/[/\\]/).pop() || '';
    const nameLower = filename.toLowerCase();

    // Default metadata parsed from filenames
    let parameters = '7B';
    let quantization = 'Q4_K_M';
    let contextLength = 8192;
    let memoryRequirementGb = 6;
    let displayName = filename.replace(/\.[^/.]+$/, "");

    if (nameLower.includes('8b')) {
      parameters = '8B';
      memoryRequirementGb = 8;
    } else if (nameLower.includes('14b')) {
      parameters = '14B';
      memoryRequirementGb = 12;
    } else if (nameLower.includes('1.5b') || nameLower.includes('3b')) {
      parameters = nameLower.includes('1.5b') ? '1.5B' : '3B';
      memoryRequirementGb = 3;
    }

    if (nameLower.includes('q8')) {
      quantization = 'Q8_0';
      memoryRequirementGb = Math.ceil(memoryRequirementGb * 1.5);
    } else if (nameLower.includes('fp16')) {
      quantization = 'FP16';
      memoryRequirementGb = memoryRequirementGb * 2;
    }

    if (nameLower.includes('qwen')) {
      contextLength = 32768;
    }

    return {
      displayName: displayName || 'Local Model',
      architecture: nameLower.includes('qwen') ? 'qwen2' : nameLower.includes('llama') ? 'llama3' : 'transformer',
      parameters,
      quantization,
      contextLength,
      tokenizer: nameLower.includes('qwen') ? 'qwen' : 'llama',
      memoryRequirementGb,
      diskSizeGb: format === 'gguf' ? 4.5 : 2.8,
      languages: ['en', 'zh', 'code'],
      state: ModelState.Validated,
      path: filePath
    };
  }
}

export const modelMetadataReader = new ModelMetadataReader();
