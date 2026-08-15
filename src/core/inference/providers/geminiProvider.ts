import { ILocalInferenceProvider, ILocalInferenceSession, ILocalInferenceResult } from '../types';
import { logKairoStage } from '../../../common/kairoLogger';

export class GeminiProvider implements ILocalInferenceProvider {
  public readonly name = 'gemini';
  private defaultModel = 'gemini-2.5-flash';
  private fallbackModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest'];
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

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
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
      return process.env.GEMINI_API_KEY.trim();
    }
    try {
      const vscode = require('vscode');
      const configKey = vscode?.workspace?.getConfiguration('kairo')?.get('geminiApiKey') ||
                        vscode?.workspace?.getConfiguration('gemini')?.get('apiKey');
      if (typeof configKey === 'string' && configKey.trim()) {
        return configKey.trim();
      }
    } catch {}
    return 'AQ.Ab8RN6LYa1fdZIKavcuc2COwTacy-cw6Kp9jCZtpnmIj2jTpLQ';
  }

  public async execute(
    session: ILocalInferenceSession,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<ILocalInferenceResult> {
    console.log('[TRACE] [Gemini] ENTER: execute. Model:', session.modelName);
    const startTime = Date.now();
    const executionId = session.requestId || `gemini-${Date.now()}`;
    const requestedModel = (session.modelName || this.defaultModel).replace(/^models\//, '');
    logKairoStage('GeminiProvider', 'ENTER', executionId, { model: requestedModel });

    const apiKey = this.getApiKey();
    if (!apiKey || apiKey.trim() === '') {
      const errMsg = '[GeminiProvider] Missing GEMINI_API_KEY environment variable. Cannot execute inference with Gemini provider.';
      console.error('[TRACE] [Gemini] ERROR:', errMsg);
      logKairoStage('GeminiProvider', 'ERROR', executionId, { model: requestedModel }, null, Date.now() - startTime, new Error(errMsg));
      throw new Error(errMsg);
    }

    const candidateModels = Array.from(new Set([requestedModel, ...this.fallbackModels]));
    let lastError: Error | null = null;

    for (const modelName of candidateModels) {
      try {
        const result = await this.executeWithModel(session, modelName, apiKey, onToken, signal, executionId, startTime);
        return result;
      } catch (err: any) {
        lastError = err;
        const index = candidateModels.indexOf(modelName);
        if (index < candidateModels.length - 1) {
          console.warn(`[GeminiProvider] Model '${modelName}' returned error (${err.message}). Trying fallback candidate '${candidateModels[index + 1]}'...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error(`[GeminiProvider] Failed to execute request across candidate models.`);
  }

  private async executeWithModel(
    session: ILocalInferenceSession,
    modelName: string,
    apiKey: string,
    onToken?: (token: string) => void,
    signal?: AbortSignal,
    executionId?: string,
    startTime: number = Date.now()
  ): Promise<ILocalInferenceResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Assemble full prompt with system instructions if present
    let fullPrompt = session.prompt;
    if (session.systemPrompt) {
      fullPrompt = `System instructions:\n${session.systemPrompt}\n\nUser request:\n${session.prompt}`;
    }

    const contents = [
      {
        role: 'user',
        parts: [{ text: fullPrompt }]
      }
    ];

    const generationConfig: Record<string, any> = {
      temperature: session.parameters.temperature ?? 0.2,
      topP: session.parameters.topP ?? 0.9,
      topK: session.parameters.topK ?? 40,
      maxOutputTokens: session.parameters.maxTokens ?? 8192
    };

    const requestBody = {
      contents,
      generationConfig
    };

    const isStreaming = Boolean(session.parameters.streamingEnabled && onToken);

    if (isStreaming) {
      const streamUrl = `${this.baseUrl}/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;
      let response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal
      });

      if (!response.ok && (response.status === 503 || response.status === 429)) {
        console.warn(`[GeminiProvider] Stream status ${response.status} high demand spike. Retrying stream once after 1.5s...`);
        await new Promise(res => setTimeout(res, 1500));
        response = await fetch(streamUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal
        });
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Gemini API stream request failed with status ${response.status}: ${errorText || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('[GeminiProvider] Response body stream reader not available.');
      }

      let generatedText = '';
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        if (signal?.aborted) {
          throw new Error('Inference execution was cancelled.');
        }

        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.candidates?.[0]?.finishReason && parsed.candidates[0].finishReason === 'SAFETY') {
                warnings.push('[GeminiProvider] Gemini response blocked due to SAFETY filter.');
              }
              const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textChunk) {
                generatedText += textChunk;
                if (onToken) {
                  onToken(textChunk);
                }
              }
            } catch {
              // Ignore incomplete line parse failures
            }
          }
        }
      }

      const duration = Date.now() - startTime;
      const resVal = {
        generatedText,
        tokenUsage: {
          promptTokens: Math.ceil(fullPrompt.length / 4),
          completionTokens: Math.ceil(generatedText.length / 4),
          totalTokens: Math.ceil(fullPrompt.length / 4) + Math.ceil(generatedText.length / 4)
        },
        executionTimeMs: duration,
        warnings: Object.freeze(warnings),
        errors: Object.freeze(errors),
        providerInfo: {
          providerName: this.name,
          modelName
        }
      };
      console.log('[TRACE] [Gemini] EXIT: execute streaming completed successfully. Text length:', generatedText.length);
      logKairoStage('GeminiProvider', 'EXIT', executionId || 'gemini', { model: modelName }, { textLength: generatedText.length }, duration);
      return resVal;
    } else {
      // Non-streaming call
      const url = `${this.baseUrl}/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal
      });

      if (!response.ok) {
        if (response.status === 503 || response.status === 429) {
          console.warn(`[GeminiProvider] Status ${response.status} high demand spike. Retrying once after 1s...`);
          await new Promise(res => setTimeout(res, 1000));
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal
          });
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text().catch(() => '');
            throw new Error(`Gemini API request failed with status ${retryResponse.status}: ${errorText || retryResponse.statusText}`);
          }
          const retryData = (await retryResponse.json()) as any;
          const generatedText = retryData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const promptTokens = retryData.usageMetadata?.promptTokenCount || Math.ceil(fullPrompt.length / 4);
          const completionTokens = retryData.usageMetadata?.candidatesTokenCount || Math.ceil(generatedText.length / 4);
          const duration = Date.now() - startTime;
          return {
            generatedText,
            tokenUsage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
            executionTimeMs: duration,
            warnings: Object.freeze(warnings),
            errors: Object.freeze(errors),
            providerInfo: { providerName: this.name, modelName }
          };
        }
        const errorText = await response.text().catch(() => '');
        throw new Error(`Gemini API request failed with status ${response.status}: ${errorText || response.statusText}`);
      }

      const data = (await response.json()) as any;

      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error('[GeminiProvider] Generation blocked by Gemini safety filters.');
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!generatedText) {
        warnings.push('[GeminiProvider] Received empty response content from Gemini.');
      }

      const promptTokens = data.usageMetadata?.promptTokenCount || Math.ceil(fullPrompt.length / 4);
      const completionTokens = data.usageMetadata?.candidatesTokenCount || Math.ceil(generatedText.length / 4);

      const duration = Date.now() - startTime;
      const resVal = {
        generatedText,
        tokenUsage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        },
        executionTimeMs: duration,
        warnings: Object.freeze(warnings),
        errors: Object.freeze(errors),
        providerInfo: {
          providerName: this.name,
          modelName
        }
      };
      console.log('[TRACE] [Gemini] EXIT: execute non-streaming completed successfully. Text length:', generatedText.length);
      logKairoStage('GeminiProvider', 'EXIT', executionId || 'gemini', { model: modelName }, { textLength: generatedText.length }, duration);
      return resVal;
    }
  }
}

export const geminiProvider = new GeminiProvider();
export default geminiProvider;
