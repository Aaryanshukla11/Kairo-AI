import { ILocalInferenceProvider, ILocalInferenceSession, ILocalInferenceResult } from './types';

export class BaseMockProvider implements ILocalInferenceProvider {
  constructor(public readonly name: string) {}

  public async execute(
    session: ILocalInferenceSession,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<ILocalInferenceResult> {
    const startTime = Date.now();

    if (signal?.aborted) {
      throw new Error('Inference execution was cancelled.');
    }

    // Mock token emission
    const responseText = `[Mock ${this.name} response] generated for prompt: "${session.prompt}"`;
    if (onToken) {
      onToken(responseText);
    }

    const duration = Date.now() - startTime;
    return {
      generatedText: responseText,
      tokenUsage: {
        promptTokens: Math.ceil(session.prompt.length / 4),
        completionTokens: Math.ceil(responseText.length / 4),
        totalTokens: Math.ceil(session.prompt.length / 4) + Math.ceil(responseText.length / 4)
      },
      executionTimeMs: duration,
      warnings: [],
      errors: [],
      providerInfo: {
        providerName: this.name,
        modelName: session.modelName
      }
    };
  }
}

export class ProviderFactory {
  public createProvider(name: string): ILocalInferenceProvider {
    return new BaseMockProvider(name);
  }
}

export const providerFactory = new ProviderFactory();
export default providerFactory;
