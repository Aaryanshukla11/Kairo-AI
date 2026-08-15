import * as assert from 'assert';
import { GeminiProvider } from '../../src/core/inference/providers/geminiProvider';
import { OllamaProvider } from '../../src/core/inference/providers/ollamaProvider';
import { providerRegistry } from '../../src/core/inference/registry';
import { localInferenceService } from '../../src/core/inference/localInferenceService';
import { ILocalInferenceSession, IModelConfig } from '../../src/core/inference/types';
import { generationContractBuilder } from '../../src/core/generation-contract';

describe('Gemini Provider Tests', () => {
  let originalFetch: typeof fetch;
  let originalEnvProvider: string | undefined;
  let originalEnvApiKey: string | undefined;

  before(() => {
    originalFetch = globalThis.fetch;
    originalEnvProvider = process.env.KAIRO_MODEL_PROVIDER;
    originalEnvApiKey = process.env.GEMINI_API_KEY;
  });

  after(() => {
    globalThis.fetch = originalFetch;
    if (originalEnvProvider !== undefined) {
      process.env.KAIRO_MODEL_PROVIDER = originalEnvProvider;
    } else {
      delete process.env.KAIRO_MODEL_PROVIDER;
    }
    if (originalEnvApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalEnvApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  const mockSession: ILocalInferenceSession = {
    requestId: 'req-gem-123',
    modelName: 'gemini-2.5-flash',
    providerName: 'gemini',
    prompt: 'Create Calculator HTML CSS',
    parameters: {
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
      maxTokens: 512,
      streamingEnabled: false
    },
    metadata: {}
  };

  it('A. Provider selection: ollama vs gemini in ProviderRegistry', () => {
    const ollama = providerRegistry.getProvider('ollama');
    assert.ok(ollama instanceof OllamaProvider, 'OllamaProvider should be registered');

    const gemini = providerRegistry.getProvider('gemini');
    assert.ok(gemini instanceof GeminiProvider, 'GeminiProvider should be registered');
  });

  it('B. Missing API key: provider=gemini with missing key throws clean error', async () => {
    const savedKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const provider = new GeminiProvider('');
    try {
      await provider.execute(mockSession);
      assert.fail('Should have thrown an error for missing GEMINI_API_KEY');
    } catch (err: any) {
      assert.ok(err.message.includes('Missing GEMINI_API_KEY'), 'Should contain clean error message');
    } finally {
      if (savedKey !== undefined) process.env.GEMINI_API_KEY = savedKey;
    }
  });

  it('C. No fallback: Gemini failure in LocalInferenceService returns error without silently executing Ollama', async () => {
    const savedKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    process.env.KAIRO_MODEL_PROVIDER = 'gemini';

    const dummyConfig: IModelConfig = {
      provider: 'ollama', // Config specifies ollama, but KAIRO_MODEL_PROVIDER=gemini overrides it
      modelName: 'qwen2.5-coder:7b',
      modelPath: '',
      contextLength: 4096,
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
      maxTokens: 1024,
      gpuLayers: 32,
      threadCount: 4,
      streamingEnabled: false
    };

    try {
      const result = await localInferenceService.execute('Test prompt', dummyConfig);
      assert.strictEqual(result.providerInfo.providerName, 'gemini');
      assert.strictEqual(result.providerInfo.modelName, 'gemini-2.5-flash');
      assert.ok(result.errors.length > 0, 'Should have recorded error');
      assert.ok(result.errors[0].includes('Missing GEMINI_API_KEY'), 'Error should specify missing API key');
      assert.strictEqual(result.generatedText, '', 'Should NOT produce fake fallback output');
    } finally {
      if (savedKey !== undefined) process.env.GEMINI_API_KEY = savedKey;
    }
  });

  it('D. Contract compatibility: Gemini normalized output reaches existing contract validation', async () => {
    // Mock Gemini API fetch response
    globalThis.fetch = async (url) => {
      if (url.toString().includes('generativelanguage.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: '{"status": "SUCCESS", "message": "Generated portfolio site"}' }]
                },
                finishReason: 'STOP'
              }
            ],
            usageMetadata: {
              promptTokenCount: 50,
              candidatesTokenCount: 20
            }
          })
        } as any;
      }
      return { ok: false, status: 500 } as any;
    };

    const provider = new GeminiProvider('fake-test-key');
    const result = await provider.execute(mockSession);
    assert.strictEqual(result.errors.length, 0);
    assert.ok(result.generatedText.includes('Generated portfolio site'));
    assert.strictEqual(result.providerInfo.providerName, 'gemini');

    // Build contract with normalized output
    const contract = generationContractBuilder.createContract({
      contractVersion: '1.0.0',
      requestId: 'req-gem-contract',
      executionId: 'exec-gem-contract',
      fileOperations: [
        {
          operationId: 'op-1',
          operationType: 'CREATE_FILE',
          filePath: 'index.html',
          relativePath: 'index.html',
          language: 'HTML',
          encoding: 'utf-8',
          content: result.generatedText,
          reason: 'Gemini generated artifact',
          dependencies: []
        }
      ],
      directoryOperations: [],
      warnings: [],
      errors: [],
      metadata: {
        generator: 'gemini-test',
        timestamp: Date.now(),
        model: 'gemini-2.5-flash',
        projectId: 'test-project'
      }
    });

    assert.strictEqual(contract.errors.length, 0);
    assert.strictEqual(contract.fileOperations.length, 1);
  });

  it('E. Ollama regression: existing Ollama behavior intact when KAIRO_MODEL_PROVIDER=ollama', async () => {
    process.env.KAIRO_MODEL_PROVIDER = 'ollama';

    globalThis.fetch = async (url) => {
      if (url.toString().endsWith('/api/tags')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ models: [{ name: 'qwen2.5-coder:7b' }] })
        } as any;
      }
      if (url.toString().endsWith('/api/generate')) {
        const payload = JSON.stringify({ response: 'console.log("ollama regression test");' });
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(payload + '\n'));
            controller.close();
          }
        });
        return { ok: true, status: 200, body: stream } as any;
      }
      return { ok: false } as any;
    };

    const dummyConfig: IModelConfig = {
      provider: 'ollama',
      modelName: 'qwen2.5-coder:7b',
      modelPath: '',
      contextLength: 4096,
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
      maxTokens: 1024,
      gpuLayers: 32,
      threadCount: 4,
      streamingEnabled: true
    };

    const result = await localInferenceService.execute('Build app', dummyConfig);
    assert.strictEqual(result.providerInfo.providerName, 'ollama');
    assert.strictEqual(result.providerInfo.modelName, 'qwen2.5-coder:7b');
    assert.strictEqual(result.generatedText, 'console.log("ollama regression test");');
  });

  it('F. Real Gemini E2E: only executes if GEMINI_API_KEY environment variable is present', async function () {
    if (!process.env.GEMINI_API_KEY) {
      console.log('  [SKIP] REAL GEMINI API TEST skipped because GEMINI_API_KEY is not set in environment.');
      this.skip();
      return;
    }

    globalThis.fetch = originalFetch; // Restore real fetch for live call
    process.env.KAIRO_MODEL_PROVIDER = 'gemini';

    const provider = new GeminiProvider();
    const result = await provider.execute({
      requestId: 'real-gemini-test',
      modelName: 'gemini-2.5-flash',
      providerName: 'gemini',
      prompt: 'Write a simple HTML page structure',
      parameters: { temperature: 0.2, maxTokens: 1024, streamingEnabled: true },
      metadata: {}
    });

    assert.strictEqual(result.errors.length, 0);
    assert.ok(result.generatedText.length > 0, 'Real Gemini API should return non-empty output');
    assert.strictEqual(result.providerInfo.providerName, 'gemini');
  });
});
