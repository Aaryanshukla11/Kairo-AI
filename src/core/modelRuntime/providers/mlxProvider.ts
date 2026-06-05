import { ModelProvider } from './baseProvider';
import { PromptPackage } from '../../promptAssembly/promptTypes';
import { ModelConfig, GenerationConfig, InferenceResult } from '../runtimeTypes';

export class MlxProvider implements ModelProvider {
  public name = 'MlxProvider';
  private currentModel: ModelConfig | null = null;
  private isBusy = false;

  public async loadModel(modelConfig: ModelConfig): Promise<void> {
    this.currentModel = modelConfig;
  }

  public async unloadModel(): Promise<void> {
    this.currentModel = null;
  }

  public async validateModel(modelConfig: ModelConfig): Promise<boolean> {
    return !!modelConfig && modelConfig.provider === 'mlx';
  }

  public async getStatus(): Promise<'available' | 'unavailable'> {
    // MLX is only available on macOS, so we mock dynamic check
    return process.platform === 'darwin' ? 'available' : 'unavailable';
  }

  public async getResourceUsage(): Promise<{ memoryBytes: number; vramBytes: number; cpuPct: number; gpuPct: number }> {
    return {
      memoryBytes: this.isBusy ? 1024 * 1024 * 1024 : 128 * 1024 * 1024,
      vramBytes: this.currentModel ? 4096 * 1024 * 1024 : 0,
      cpuPct: this.isBusy ? 20 : 1,
      gpuPct: this.isBusy ? 80 : 0
    };
  }

  public async generate(
    promptPkg: PromptPackage,
    config: GenerationConfig,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<InferenceResult> {
    this.isBusy = true;
    const start = Date.now();
    const responseText = `[MLX response] Generated using Apple Silicon MLX backend for prompt: ${promptPkg.userPrompt.substring(0, 30)}...`;
    
    const words = responseText.split(' ');
    let outputText = '';
    let tokensGenerated = 0;

    try {
      for (const word of words) {
        if (signal?.aborted) {
          return {
            id: `mlx-${start}`,
            sessionId: 'session-mlx',
            tokensGenerated,
            finishReason: 'cancelled',
            latencyMs: Date.now() - start,
            usage: {
              promptTokens: Math.ceil(promptPkg.userPrompt.length / 4),
              completionTokens: tokensGenerated,
              totalTokens: Math.ceil(promptPkg.userPrompt.length / 4) + tokensGenerated
            },
            response: outputText
          };
        }
        outputText += word + ' ';
        tokensGenerated += Math.ceil(word.length / 4);
        if (onToken) onToken(word + ' ');
        await new Promise(r => setTimeout(r, 5));
      }
      return {
        id: `mlx-${start}`,
        sessionId: 'session-mlx',
        tokensGenerated,
        finishReason: 'stop',
        latencyMs: Date.now() - start,
        usage: {
          promptTokens: Math.ceil(promptPkg.userPrompt.length / 4),
          completionTokens: tokensGenerated,
          totalTokens: Math.ceil(promptPkg.userPrompt.length / 4) + tokensGenerated
        },
        response: outputText
      };
    } finally {
      this.isBusy = false;
    }
  }
}
