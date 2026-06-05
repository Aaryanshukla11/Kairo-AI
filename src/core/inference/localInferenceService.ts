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

    const envProvider = (process.env.KAIRO_MODEL_PROVIDER || '').trim().toLowerCase();
    const primaryProviderName = envProvider || config.provider || 'openai';

    // Construct provider failover chain (Primary provider first; Ollama fallback if OpenAI primary)
    const providerChain: string[] = [primaryProviderName];
    if (primaryProviderName === 'openai') {
      providerChain.push('ollama');
    }

    logKairoStage('LocalInferenceService', 'ENTER', requestId, { primaryProvider: primaryProviderName });

    // Cancellation & Timeout Controller integration
    const controller = new AbortController();
    const signal = controller.signal;

    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', () => {
          controller.abort();
        });
      }
    }

    const timeoutMs = (config as any).timeoutMs || 120000;
    const timeoutHandle = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const visitedProviders = new Set<string>();
    const aggregatedErrors: string[] = [];
    let initialModelName = config.modelName;

    for (const providerName of providerChain) {
      if (visitedProviders.has(providerName)) {
        continue;
      }
      visitedProviders.add(providerName);

      if (signal.aborted) {
        clearTimeout(timeoutHandle);
        const err = new Error('Inference execution was cancelled.');
        logKairoStage('LocalInferenceService', 'ERROR', requestId, { provider: providerName }, null, Date.now() - startTime, err);
        return {
          generatedText: '',
          tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          executionTimeMs: Date.now() - startTime,
          warnings: [],
          errors: Object.freeze([err.message]),
          providerInfo: { providerName: primaryProviderName, modelName: initialModelName }
        };
      }

      // Resolve model name for the target provider
      let effectiveModelName = config.modelName;
      if (providerName === 'openai') {
        effectiveModelName = process.env.OPENAI_MODEL || (config.provider === 'openai' ? config.modelName : 'gpt-4o');
      } else if (providerName === 'ollama') {
        effectiveModelName = process.env.OLLAMA_MODEL || (config.provider === 'ollama' ? config.modelName : 'qwen2.5-coder:7b');
      }
      if (providerName === primaryProviderName) {
        initialModelName = effectiveModelName;
      }

      // Resolve provider instance from registry or factory
      let provider = providerRegistry.getProvider(providerName);
      if (!provider) {
        try {
          provider = providerFactory.createProvider(providerName);
          providerRegistry.registerProvider(provider);
        } catch (factoryErr: any) {
          aggregatedErrors.push(`[${providerName}] Provider resolution error: ${factoryErr.message || factoryErr}`);
          continue;
        }
      }

      const session: ILocalInferenceSession = {
        requestId,
        modelName: effectiveModelName,
        providerName,
        prompt,
        parameters: {
          temperature: config.temperature,
          topP: config.topP,
          topK: config.topK,
          maxTokens: config.maxTokens,
          gpuLayers: config.gpuLayers,
          threadCount: config.threadCount,
          streamingEnabled: config.streamingEnabled
        },
        metadata: {
          contextLength: config.contextLength,
          modelPath: config.modelPath,
          timestamp: Date.now()
        }
      };

      try {
        logKairoStage('LocalInferenceService', 'ENTER', requestId, { provider: providerName, model: effectiveModelName });
        const result = await provider.execute(session, onToken, signal);

        const hasErrors = result.errors && result.errors.length > 0;
        const hasOutput = Boolean(result.generatedText && result.generatedText.trim().length > 0);

        if (!hasErrors && hasOutput) {
          clearTimeout(timeoutHandle);
          const duration = Date.now() - startTime;
          logKairoStage('LocalInferenceService', 'EXIT', requestId, { model: result.providerInfo?.modelName || effectiveModelName, provider: providerName }, { textLength: result.generatedText.length }, duration);
          return this.deepFreeze(result);
        } else {
          const errMsg = hasErrors ? result.errors.join('; ') : `Empty output generated by provider ${providerName}`;
          aggregatedErrors.push(`[${providerName}] ${errMsg}`);
          console.warn(`[LocalInferenceService] Provider '${providerName}' returned error or empty output (${errMsg}). Failover check...`);
        }
      } catch (err: any) {
        const errMsg = err.message || String(err);
        aggregatedErrors.push(`[${providerName}] ${errMsg}`);
        console.warn(`[LocalInferenceService] Provider '${providerName}' failed (${errMsg}). Failover check...`);

        if (signal.aborted || err.name === 'AbortError' || errMsg.includes('cancelled')) {
          break;
        }
      }
    }

    clearTimeout(timeoutHandle);
    const duration = Date.now() - startTime;
    logKairoStage('LocalInferenceService', 'ERROR', requestId, { primaryProvider: primaryProviderName }, null, duration, new Error(aggregatedErrors.join(' | ')));

    return {
      generatedText: '',
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      executionTimeMs: duration,
      warnings: [],
      errors: Object.freeze([...aggregatedErrors]),
      providerInfo: {
        providerName: primaryProviderName,
        modelName: initialModelName
      }
    };
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
