import { ModelProvider } from './baseProvider';
import { PromptPackage } from '../../promptAssembly/promptTypes';
import { ModelConfig, GenerationConfig, InferenceResult } from '../runtimeTypes';

export class MockProvider implements ModelProvider {
  public name = 'MockModelProvider';
  private currentModel: ModelConfig | null = null;
  private isBusy = false;

  public async loadModel(modelConfig: ModelConfig): Promise<void> {
    this.currentModel = modelConfig;
  }

  public async unloadModel(): Promise<void> {
    this.currentModel = null;
  }

  public async validateModel(modelConfig: ModelConfig): Promise<boolean> {
    return !!modelConfig && !!modelConfig.modelId;
  }

  public async getStatus(): Promise<'available' | 'unavailable'> {
    return 'available';
  }

  public async getResourceUsage(): Promise<{ memoryBytes: number; vramBytes: number; cpuPct: number; gpuPct: number }> {
    return {
      memoryBytes: this.isBusy ? 850 * 1024 * 1024 : 220 * 1024 * 1024,
      vramBytes: this.currentModel ? (this.currentModel.modelId.includes('7b') ? 4200 * 1024 * 1024 : 4900 * 1024 * 1024) : 0,
      cpuPct: this.isBusy ? 45 : 2,
      gpuPct: this.isBusy ? 35 : 0
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
    
    const responseText = `[Mock response for: "${promptPkg.userPrompt}"]\nBased on your retrieved workspace files, I recommend extending the validation logic to verify character token counts. Here is the implementation:\n\n\`\`\`typescript\nexport function validateTokenLimit(text: string, limit: number): boolean {\n  return (text.length / 4) <= limit;\n}\n\`\`\``;

    const words = responseText.split(' ');
    let outputText = '';
    let tokensGenerated = 0;

    try {
      for (let i = 0; i < words.length; i++) {
        if (signal?.aborted) {
          return {
            id: `inf-${start}`,
            sessionId: 'session-default',
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

        const word = words[i] + ' ';
        outputText += word;
        tokensGenerated += Math.ceil(word.length / 4);

        if (onToken) {
          onToken(word);
        }

        await new Promise(resolve => setTimeout(resolve, 5));
      }

      return {
        id: `inf-${start}`,
        sessionId: 'session-default',
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
