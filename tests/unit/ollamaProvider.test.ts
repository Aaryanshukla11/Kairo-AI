import * as assert from 'assert';
import { OllamaProvider } from '../../src/core/inference/providers/ollamaProvider';
import { ILocalInferenceSession } from '../../src/core/inference';

describe('Sprint 4A - Ollama Provider Tests', () => {
  let originalFetch: typeof fetch;

  before(() => {
    originalFetch = globalThis.fetch;
  });

  after(() => {
    globalThis.fetch = originalFetch;
  });

  const mockSession: ILocalInferenceSession = {
    requestId: 'req-123',
    modelName: 'qwen2.5-coder:7b',
    providerName: 'ollama',
    prompt: 'Create Calculator using HTML CSS',
    parameters: {
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
      maxTokens: 128
    },
    metadata: {}
  };

  it('should detect running server and fetch available models list', async () => {
    // Mock fetch for server status and models tags
    globalThis.fetch = async (url) => {
      if (url.toString().endsWith('/api/tags')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            models: [
              { name: 'qwen2.5-coder:7b' },
              { name: 'qwen2.5-instruct:latest' }
            ]
          })
        } as any;
      }
      return { ok: false, status: 500 } as any;
    };

    const provider = new OllamaProvider('http://localhost:11434');
    assert.strictEqual(await provider.isServerRunning(), true);
    
    const models = await provider.getAvailableModels();
    assert.strictEqual(models.length, 2);
    assert.ok(models.includes('qwen2.5-coder:7b'));
  });

  it('should stream generated tokens response successfully', async () => {
    // Mock streaming generate response
    globalThis.fetch = async (url, options) => {
      if (url.toString().endsWith('/api/tags')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ models: [{ name: 'qwen2.5-coder:7b' }] })
        } as any;
      }

      if (url.toString().endsWith('/api/generate')) {
        // Return mock readable stream
        const payload1 = JSON.stringify({ response: 'index.html ' });
        const payload2 = JSON.stringify({ response: 'style.css' });
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(payload1 + '\n'));
            controller.enqueue(encoder.encode(payload2 + '\n'));
            controller.close();
          }
        });

        return {
          ok: true,
          status: 200,
          body: stream
        } as any;
      }
      return { ok: false } as any;
    };

    const provider = new OllamaProvider();
    const tokens: string[] = [];
    const result = await provider.execute(mockSession, (tok) => tokens.push(tok));

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.generatedText, 'index.html style.css');
    assert.strictEqual(tokens.length, 2);
    assert.strictEqual(tokens[0], 'index.html ');
    assert.strictEqual(tokens[1], 'style.css');
  });

});
