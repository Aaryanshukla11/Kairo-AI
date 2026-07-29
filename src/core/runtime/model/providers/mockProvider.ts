import { ModelProvider } from './baseProvider';
import { PromptPackage } from '../../../promptAssembly/promptTypes';
import { ModelConfig, GenerationConfig, InferenceResult } from '../runtimeTypes';

export class MockProvider implements ModelProvider {
  public name = 'MockModelProvider';
  private currentModel: ModelConfig | null = null;

  public async loadModel(modelConfig: ModelConfig): Promise<void> {
    this.currentModel = modelConfig;
  }

  public async unloadModel(): Promise<void> {
    this.currentModel = null;
  }

  /**
   * Streams word intervals to the token callback, checks abort signal cancellations, and returns InferenceResults.
   */
  public async generate(
    promptPkg: PromptPackage,
    config: GenerationConfig,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<InferenceResult> {
    const start = Date.now();
    
    const responseText = `[Mock response for: "${promptPkg.userPrompt}"]\nBased on your retrieved workspace files, I recommend extending the validation logic to verify character token counts. Here is the implementation:\n\n\`\`\`typescript\nexport function validateTokenLimit(text: string, limit: number): boolean {\n  return (text.length / 4) <= limit;\n}\n\`\`\``;

    const words = responseText.split(' ');
    let outputText = '';
    let tokensGenerated = 0;

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

      await new Promise(resolve => setTimeout(resolve, 10));
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
  }
}
