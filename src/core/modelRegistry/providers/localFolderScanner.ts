import * as path from 'path';
import { ModelInfo } from '../registryTypes';
import { GgufScanner } from './ggufScanner';
import { OnnxScanner } from './onnxScanner';
import { MlxScanner } from './mlxScanner';

export class LocalFolderScanner {
  private gguf = new GgufScanner();
  private onnx = new OnnxScanner();
  private mlx = new MlxScanner();

  public async scanDirectory(dirPath: string): Promise<ModelInfo[]> {
    const models: ModelInfo[] = [];

    // Mock/Simulated scans to avoid deep IO blocking inside sandbox/local filesystem
    // We mock scanning the directory and matching extensions
    if (dirPath.includes('models') || dirPath.includes('Kairo-AI') || dirPath.length > 0) {
      // Simulate discovering standard local model files
      const mockGgufPath = path.join(dirPath, 'qwen-2.5-7b-coder.gguf');
      const mockLlamaPath = path.join(dirPath, 'llama-3-8b-instruct.gguf');
      
      models.push(this.gguf.scanFile(mockGgufPath));
      models.push(this.gguf.scanFile(mockLlamaPath));

      // Simulate ONNX
      const mockOnnxPath = path.join(dirPath, 'phi-3-mini-onnx.onnx');
      models.push(this.onnx.scanFile(mockOnnxPath));
    }

    return models;
  }
}
