import { ModelProvider } from './baseProvider';
import { PromptPackage } from '../../promptAssembly/promptTypes';
import { ModelConfig, GenerationConfig, InferenceResult } from '../runtimeTypes';

export class LlamaCppProvider implements ModelProvider {
  public name = 'LlamaCppProvider';
  private currentModel: ModelConfig | null = null;
  private isBusy = false;

  public async loadModel(modelConfig: ModelConfig): Promise<void> {
    this.currentModel = modelConfig;
  }

  public async unloadModel(): Promise<void> {
    this.currentModel = null;
  }

  public async validateModel(modelConfig: ModelConfig): Promise<boolean> {
    return !!modelConfig && modelConfig.provider === 'llama.cpp';
  }

  public async getStatus(): Promise<'available' | 'unavailable'> {
    return 'available';
  }

  public async getResourceUsage(): Promise<{ memoryBytes: number; vramBytes: number; cpuPct: number; gpuPct: number }> {
    return {
      memoryBytes: this.isBusy ? 1024 * 1024 * 1024 : 128 * 1024 * 1024,
      vramBytes: this.currentModel ? 3000 * 1024 * 1024 : 0,
      cpuPct: this.isBusy ? 60 : 1,
      gpuPct: this.isBusy ? 70 : 0
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
    const responseText = `[llama.cpp response] Generated using llama.cpp backend for prompt: ${promptPkg.userPrompt.substring(0, 30)}...`;
    
    const words = responseText.split(' ');
    let outputText = '';
    let tokensGenerated = 0;

    try {
      for (const word of words) {
        if (signal?.aborted) {
          return {
            id: `llama-${start}`,
            sessionId: 'session-llama',
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
        id: `llama-${start}`,
        sessionId: 'session-llama',
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
