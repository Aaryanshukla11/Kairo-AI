import { ILocalInferenceProvider, ILocalInferenceSession, ILocalInferenceResult } from '../types';
import { logKairoStage } from '../../../common/kairoLogger';

export class OllamaProvider implements ILocalInferenceProvider {
  public readonly name = 'ollama';
  private serverUrl = 'http://localhost:11434';

  constructor(customUrl?: string) {
    if (customUrl) {
      this.serverUrl = customUrl;
    }
  }

  public async isServerRunning(): Promise<boolean> {
    try {
      const res = await fetch(`${this.serverUrl}/api/tags`);
      return res.status === 200;
    } catch {
      return false;
    }
  }

  public async getAvailableModels(): Promise<string[]> {
    try {
      const res = await fetch(`${this.serverUrl}/api/tags`);
      if (!res.ok) return [];
      const data = await res.json() as { models?: Array<{ name: string }> };
      return (data.models || []).map(m => m.name);
    } catch {
      return [];
    }
  }

  public async execute(
    session: ILocalInferenceSession,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<ILocalInferenceResult> {
    console.log('[TRACE] [Ollama] ENTER: execute. Model:', session.modelName);
    const startTime = Date.now();
    const executionId = session.requestId || `ollama-${Date.now()}`;
    logKairoStage('OllamaProvider', 'ENTER', executionId, { model: session.modelName });

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Verify server status
      const running = await this.isServerRunning();
      if (!running) {
        throw new Error(`Ollama Server is not running at ${this.serverUrl}. Make sure Ollama is installed and started.`);
      }

      // 2. Verify model availability
      const availableModels = await this.getAvailableModels();
      const matchesModel = availableModels.some(m => m.includes(session.modelName) || session.modelName.includes(m));
      if (!matchesModel && availableModels.length > 0) {
        warnings.push(`Model '${session.modelName}' was not found in available models: [${availableModels.join(', ')}]. Attempting call anyway.`);
      }

      // 3. Initiate post request with stream support
      const response = await fetch(`${this.serverUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: session.modelName,
          prompt: session.prompt,
          system: session.systemPrompt,
          options: {
            temperature: session.parameters.temperature,
            top_p: session.parameters.topP,
            top_k: session.parameters.topK,
            num_predict: session.parameters.maxTokens
          },
          stream: true
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Ollama generation request failed with status code ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body stream reader not available.');
      }

      let generatedText = '';
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        if (signal?.aborted) {
          throw new Error('Inference cancelled.');
        }

        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunkStr = decoder.decode(value, { stream: !done });
          const lines = chunkStr.split('\n').filter(l => l.trim() !== '');

          for (const line of lines) {
            try {
              const parsedLine = JSON.parse(line);
              if (parsedLine.done && parsedLine.done_reason === 'length') {
                warnings.push('[OllamaProvider] WARNING: Response reached max num_predict length limit!');
                console.warn('[OllamaProvider] Output truncation detected (done_reason=length)!');
              }
              if (parsedLine.response) {
                generatedText += parsedLine.response;
                if (onToken) {
                  onToken(parsedLine.response);
                }
              }
            } catch {
              // Ignore partial or malformed lines
            }
          }
        }
      }

      const duration = Date.now() - startTime;
      const resVal = {
        generatedText,
        tokenUsage: {
          promptTokens: Math.ceil(session.prompt.length / 4),
          completionTokens: Math.ceil(generatedText.length / 4),
          totalTokens: Math.ceil(session.prompt.length / 4) + Math.ceil(generatedText.length / 4)
        },
        executionTimeMs: duration,
        warnings: Object.freeze(warnings),
        errors: Object.freeze(errors),
        providerInfo: {
          providerName: this.name,
          modelName: session.modelName
        }
      };
      console.log('[TRACE] [Ollama] EXIT: execute completed successfully. Text length:', generatedText.length);
      logKairoStage('OllamaProvider', 'EXIT', executionId, { model: session.modelName }, { textLength: generatedText.length }, duration);
      return resVal;
    } catch (err: any) {
      console.log('[TRACE] [Ollama] EXIT: execute failed with error:', err.message);
      const duration = Date.now() - startTime;
      logKairoStage('OllamaProvider', 'ERROR', executionId, { model: session.modelName }, null, duration, err);
      if (signal?.aborted || err.name === 'AbortError') {
        throw new Error('Inference execution was cancelled.');
      }
      throw err;
    }
  }
}

export const ollamaProvider = new OllamaProvider();
export default ollamaProvider;
