import { ModelInfo, ModelState } from '../registryTypes';
import { modelMetadataReader } from '../modelMetadata';

export class OnnxScanner {
  public scanFile(filePath: string): ModelInfo {
    const meta = modelMetadataReader.extractMetadata(filePath, 'onnx');
    const filename = filePath.split(/[/\\]/).pop() || '';
    const cleanId = filename.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    return {
      modelId: cleanId || 'onnx-model',
      displayName: meta.displayName || 'ONNX Local Model',
      provider: 'onnx',
      architecture: meta.architecture || 'transformer',
      format: 'onnx',
      version: '1.0.0',
      parameters: meta.parameters || '3B',
      quantization: meta.quantization || 'ONNX_INT4',
      contextLength: meta.contextLength || 4096,
      tokenizer: meta.tokenizer || 'onnx',
      memoryRequirementGb: meta.memoryRequirementGb || 4,
      diskSizeGb: meta.diskSizeGb || 2.5,
      languages: meta.languages || ['en'],
      capabilities: [],
      healthStatus: 'Healthy',
      state: ModelState.Discovered,
      path: filePath
    };
  }
}
