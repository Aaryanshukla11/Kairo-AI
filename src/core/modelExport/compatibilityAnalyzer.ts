import { CompatibilityMatrix, ExportFormat } from './exportTypes';

export class CompatibilityAnalyzer {
  public analyzeCompatibility(_format: ExportFormat, modelSize: number): CompatibilityMatrix {
    // Hidden dim 4096, 8B params, fp16 is ~16GB
    const rawRamReq = modelSize > 7000000000 ? 16 : 8;

    return {
      gguf: {
        supported: true,
        minRamGB: Math.ceil(rawRamReq * 0.4), // quantized GGUF fits in small memory
        backend: 'llama.cpp'
      },
      safetensors: {
        supported: true,
        minRamGB: rawRamReq,
        backend: 'Hugging Face transformers'
      },
      onnx: {
        supported: true,
        minRamGB: rawRamReq + 4, // ONNX needs graph overhead RAM
        backend: 'ONNX Runtime'
      },
      huggingface: {
        supported: true,
        minRamGB: rawRamReq,
        backend: 'Hugging Face Hub CLI'
      },
      pytorch: {
        supported: true,
        minRamGB: rawRamReq,
        backend: 'PyTorch native'
      }
    };
  }
}

export const compatibilityAnalyzer = new CompatibilityAnalyzer();
export default compatibilityAnalyzer;
