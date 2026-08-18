import { ILocalInferenceProvider, ILocalInferenceSession, ILocalInferenceResult } from '../types';
import { logKairoStage } from '../../../common/kairoLogger';

export class OpenAIProvider implements ILocalInferenceProvider {
  public readonly name = 'openai';
  private defaultModel = 'gpt-4o';
  private fallbackModels = ['gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private customApiKey?: string, private customBaseUrl?: string) {
    if (customBaseUrl) {
      this.baseUrl = customBaseUrl;
    }
  }

  public setApiKey(apiKey: string): void {
    this.customApiKey = apiKey;
  }

  private getApiKey(): string | undefined {
    if (this.customApiKey && this.customApiKey.trim()) {
      return this.customApiKey.trim();
    }
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
      return process.env.OPENAI_API_KEY.trim();
    }
    try {
      const vscode = require('vscode');
      const configKey = vscode?.workspace?.getConfiguration('kairo')?.get('openaiApiKey') ||
                        vscode?.workspace?.getConfiguration('openai')?.get('apiKey');
      if (typeof configKey === 'string' && configKey.trim()) {
        return configKey.trim();
      }
    } catch {}
    return undefined;
  }

  public async execute(
    session: ILocalInferenceSession,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<ILocalInferenceResult> {
    console.log('[TRACE] [OpenAI] ENTER: execute. Model:', session.modelName);
    const startTime = Date.now();
    const executionId = session.requestId || `openai-${Date.now()}`;
    const requestedModel = session.modelName || this.defaultModel;
    logKairoStage('OpenAIProvider', 'ENTER', executionId, { model: requestedModel });

    const apiKey = this.getApiKey();
    if (!apiKey || apiKey.trim() === '') {
      const errMsg = '[OpenAIProvider] Missing OPENAI_API_KEY environment variable or kairo.openaiApiKey setting. Cannot execute inference with OpenAI provider.';
      console.error('[TRACE] [OpenAI] ERROR:', errMsg);
      logKairoStage('OpenAIProvider', 'ERROR', executionId, { model: requestedModel }, null, Date.now() - startTime, new Error(errMsg));
      return {
        generatedText: '',
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        executionTimeMs: Date.now() - startTime,
        warnings: [],
        errors: Object.freeze([errMsg]),
        providerInfo: { providerName: 'openai', modelName: requestedModel }
      };
    }

    const candidateModels = Array.from(new Set([requestedModel, ...this.fallbackModels]));
    let lastError: Error | null = null;

    for (const modelName of candidateModels) {
      if (signal?.aborted) {
        throw new Error('Inference execution was cancelled.');
      }

      try {
        console.log(`[OpenAIProvider] Attempting model: ${modelName}`);
        const result = await this.callOpenAIAPI(modelName, apiKey, session, onToken, signal);
        const duration = Date.now() - startTime;
        logKairoStage('OpenAIProvider', 'EXIT', executionId, { model: modelName }, { textLength: result.generatedText.length }, duration);
        return result;
      } catch (err: any) {
        console.warn(`[OpenAIProvider] Model ${modelName} failed:`, err.message || err);
        lastError = err;
        if (signal?.aborted || err.name === 'AbortError') {
          break;
        }
      }
    }

    const duration = Date.now() - startTime;
    const finalErrorMsg = lastError ? lastError.message : 'All OpenAI models failed';
    logKairoStage('OpenAIProvider', 'ERROR', executionId, { model: requestedModel }, null, duration, new Error(finalErrorMsg));

    return {
      generatedText: '',
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      executionTimeMs: duration,
      warnings: [],
      errors: Object.freeze([finalErrorMsg]),
      providerInfo: { providerName: 'openai', modelName: requestedModel }
    };
  }

  private async callOpenAIAPI(
    modelName: string,
    apiKey: string,
    session: ILocalInferenceSession,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<ILocalInferenceResult> {
    const startTime = Date.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    const messages = [
      {
        role: 'system',
        content: session.systemPrompt || 'You are an expert AI software engineer. Generate precise, production-ready source code, components, and project implementations strictly as requested by the user. Always return complete, working, high quality source code.'
      },
      {
        role: 'user',
        content: session.prompt
      }
    ];

    const body: any = {
      model: modelName,
      messages,
      temperature: session.parameters?.temperature ?? 0.2,
      max_tokens: session.parameters?.maxTokens ?? 4096,
      top_p: session.parameters?.topP ?? 0.9,
      stream: Boolean(onToken && session.parameters?.streamingEnabled !== false)
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMsg = errorText;
      try {
        const parsed = JSON.parse(errorText);
        parsedMsg = parsed.error?.message || errorText;
      } catch {}
      throw new Error(`OpenAI API call failed (HTTP ${response.status}): ${parsedMsg}`);
    }

    let generatedText = '';
    let promptTokens = 0;
    let completionTokens = 0;

    if (body.stream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const chunkText = data.choices?.[0]?.delta?.content || '';
              if (chunkText) {
                generatedText += chunkText;
                if (onToken) {
                  onToken(chunkText);
                }
              }
            } catch {}
          }
        }
      }
    } else {
      const data: any = await response.json();
      generatedText = data.choices?.[0]?.message?.content || '';
      promptTokens = data.usage?.prompt_tokens || Math.ceil(session.prompt.length / 4);
      completionTokens = data.usage?.completion_tokens || Math.ceil(generatedText.length / 4);
    }

    if (!promptTokens) promptTokens = Math.ceil(session.prompt.length / 4);
    if (!completionTokens) completionTokens = Math.ceil(generatedText.length / 4);

    return {
      generatedText,
      tokenUsage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      },
      executionTimeMs: Date.now() - startTime,
      warnings: [],
      errors: Object.freeze([]),
      providerInfo: {
        providerName: 'openai',
        modelName
      }
    };
  }
}
