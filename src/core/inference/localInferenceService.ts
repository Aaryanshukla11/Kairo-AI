import { ILocalInferenceSession, ILocalInferenceResult, IModelConfig } from './types';
import { providerRegistry } from './registry';
import { providerFactory } from './factory';
import * as crypto from 'crypto';
import { logKairoStage } from '../../common/kairoLogger';

export class LocalInferenceService {
  public async execute(
    prompt: string,
    config: IModelConfig,
    onToken?: (token: string) => void,
    externalSignal?: AbortSignal
  ): Promise<ILocalInferenceResult> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
    logKairoStage('LocalInferenceService', 'ENTER', requestId, { model: config.modelName, provider: config.provider });

    // Resolve provider, register dynamically if not present
    let provider = providerRegistry.getProvider(config.provider);
    if (!provider) {
      provider = providerFactory.createProvider(config.provider);
      providerRegistry.registerProvider(provider);
    }

    // Build session
    const session: ILocalInferenceSession = {
      requestId,
      modelName: config.modelName,
      providerName: config.provider,
      prompt,
      parameters: {
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
        maxTokens: config.maxTokens,
        gpuLayers: config.gpuLayers,
        threadCount: config.threadCount
      },
      metadata: {
        contextLength: config.contextLength,
        modelPath: config.modelPath,
        timestamp: Date.now()
      }
    };

    // Cancellation & Timeout Controller integration
    const controller = new AbortController();
    const signal = controller.signal;

    if (externalSignal) {
      externalSignal.addEventListener('abort', () => {
        controller.abort();
      });
    }

    // Set timeout trigger if maximum execution threshold reached
    const timeoutMs = (config as any).timeoutMs || 120000;
    const timeoutHandle = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      if (signal.aborted) {
        throw new Error('Inference execution was cancelled.');
      }

      const result = await provider.execute(session, onToken, signal);
      clearTimeout(timeoutHandle);
      const duration = Date.now() - startTime;
      logKairoStage('LocalInferenceService', 'EXIT', requestId, { model: config.modelName }, { textLength: result.generatedText.length }, duration);
      return this.deepFreeze(result);
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      const duration = Date.now() - startTime;
      logKairoStage('LocalInferenceService', 'ERROR', requestId, { model: config.modelName }, null, duration, err);
      return {
        generatedText: '',
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        executionTimeMs: Date.now() - startTime,
        warnings: [],
        errors: Object.freeze([err.message || String(err)]),
        providerInfo: {
          providerName: config.provider,
          modelName: config.modelName
        }
      };
    }
  }

  private deepFreeze<T>(obj: T): T {
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  }
}

export const localInferenceService = new LocalInferenceService();
export default localInferenceService;
