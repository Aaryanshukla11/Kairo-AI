import * as assert from 'assert';
import { LocalInferenceService } from '../../src/core/inference/localInferenceService';
import { providerRegistry } from '../../src/core/inference/registry';
import { ILocalInferenceProvider, ILocalInferenceSession, ILocalInferenceResult, IModelConfig } from '../../src/core/inference/types';

class MockProvider implements ILocalInferenceProvider {
  public name: string;
  public callCount = 0;
  private behavior: () => Promise<ILocalInferenceResult> | ILocalInferenceResult;

  constructor(
    name: string,
    behavior: () => Promise<ILocalInferenceResult> | ILocalInferenceResult
  ) {
    this.name = name;
    this.behavior = behavior;
  }

  public async execute(
    session: ILocalInferenceSession,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<ILocalInferenceResult> {
    this.callCount++;
    return await this.behavior();
  }
}

describe('LocalInferenceService Cross-Provider Failover Tests', () => {
  let originalEnvProvider: string | undefined;

  beforeEach(() => {
    originalEnvProvider = process.env.KAIRO_MODEL_PROVIDER;
    delete process.env.KAIRO_MODEL_PROVIDER;
    providerRegistry.removeProvider('gemini');
    providerRegistry.removeProvider('ollama');
  });

  afterEach(() => {
    if (originalEnvProvider !== undefined) {
      process.env.KAIRO_MODEL_PROVIDER = originalEnvProvider;
    } else {
      delete process.env.KAIRO_MODEL_PROVIDER;
    }
  });

  const defaultConfig: IModelConfig = {
    provider: 'gemini',
    modelName: 'gemini-2.5-flash',
    modelPath: '',
    contextLength: 4096,
    temperature: 0.2,
    topP: 0.9,
    topK: 40,
    maxTokens: 512,
    gpuLayers: 0,
    threadCount: 4,
    streamingEnabled: false
  };

  it('TEST 1: Gemini succeeds -> Gemini called once, Ollama NOT called', async () => {
    const geminiMock = new MockProvider('gemini', () => ({
      generatedText: 'Gemini generated plan',
      tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      executionTimeMs: 100,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'gemini', modelName: 'gemini-2.5-flash' }
    }));

    const ollamaMock = new MockProvider('ollama', () => ({
      generatedText: 'Ollama text',
      tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      executionTimeMs: 100,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
    }));

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const service = new LocalInferenceService();
    const result = await service.execute('Test prompt', defaultConfig);

    assert.strictEqual(geminiMock.callCount, 1, 'Gemini should be called once');
    assert.strictEqual(ollamaMock.callCount, 0, 'Ollama should NOT be called when Gemini succeeds');
    assert.strictEqual(result.generatedText, 'Gemini generated plan');
    assert.strictEqual(result.providerInfo.providerName, 'gemini');
  });

  it('TEST 2: Gemini fails after provider execution, Ollama available and succeeds', async () => {
    const geminiMock = new MockProvider('gemini', () => {
      throw new Error('Gemini API connection error');
    });

    const ollamaMock = new MockProvider('ollama', () => ({
      generatedText: 'Ollama failover plan',
      tokenUsage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
      executionTimeMs: 150,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
    }));

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const service = new LocalInferenceService();
    const result = await service.execute('Test prompt', defaultConfig);

    assert.strictEqual(geminiMock.callCount, 1, 'Gemini should be called');
    assert.strictEqual(ollamaMock.callCount, 1, 'Ollama should be called as failover');
    assert.strictEqual(result.generatedText, 'Ollama failover plan');
    assert.strictEqual(result.providerInfo.providerName, 'ollama');
  });

  it('TEST 3: Gemini 503 failure -> LocalInferenceService invokes Ollama after GeminiProvider returns failure', async () => {
    const geminiMock = new MockProvider('gemini', () => ({
      generatedText: '',
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      executionTimeMs: 200,
      warnings: [],
      errors: ['Gemini API request failed with status 503: High demand spike'],
      providerInfo: { providerName: 'gemini', modelName: 'gemini-2.5-flash' }
    }));

    const ollamaMock = new MockProvider('ollama', () => ({
      generatedText: 'Ollama 503 failover response',
      tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      executionTimeMs: 100,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
    }));

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const service = new LocalInferenceService();
    const result = await service.execute('Test prompt', defaultConfig);

    assert.strictEqual(geminiMock.callCount, 1, 'Gemini should be called once');
    assert.strictEqual(ollamaMock.callCount, 1, 'Ollama should be called on 503');
    assert.strictEqual(result.generatedText, 'Ollama 503 failover response');
    assert.strictEqual(result.providerInfo.providerName, 'ollama');
  });

  it('TEST 4: Gemini 429 failure -> Ollama fallback occurs after GeminiProvider reports final failure', async () => {
    const geminiMock = new MockProvider('gemini', () => ({
      generatedText: '',
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      executionTimeMs: 200,
      warnings: [],
      errors: ['Gemini API request failed with status 429: Rate limit exceeded'],
      providerInfo: { providerName: 'gemini', modelName: 'gemini-2.5-flash' }
    }));

    const ollamaMock = new MockProvider('ollama', () => ({
      generatedText: 'Ollama 429 failover response',
      tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      executionTimeMs: 100,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
    }));

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const service = new LocalInferenceService();
    const result = await service.execute('Test prompt', defaultConfig);

    assert.strictEqual(geminiMock.callCount, 1);
    assert.strictEqual(ollamaMock.callCount, 1);
    assert.strictEqual(result.generatedText, 'Ollama 429 failover response');
    assert.strictEqual(result.providerInfo.providerName, 'ollama');
  });

  it('TEST 5: Gemini network failure -> Ollama fallback occurs', async () => {
    const geminiMock = new MockProvider('gemini', () => {
      throw new TypeError('fetch failed: ENOTFOUND generativelanguage.googleapis.com');
    });

    const ollamaMock = new MockProvider('ollama', () => ({
      generatedText: 'Ollama network failover response',
      tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      executionTimeMs: 100,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
    }));

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const service = new LocalInferenceService();
    const result = await service.execute('Test prompt', defaultConfig);

    assert.strictEqual(geminiMock.callCount, 1);
    assert.strictEqual(ollamaMock.callCount, 1);
    assert.strictEqual(result.generatedText, 'Ollama network failover response');
  });

  it('TEST 6: Gemini fails + Ollama unavailable -> honest failure', async () => {
    const geminiMock = new MockProvider('gemini', () => {
      throw new Error('Gemini HTTP 503 service unavailable');
    });

    const ollamaMock = new MockProvider('ollama', () => {
      throw new Error('Ollama Server is not running at http://localhost:11434');
    });

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const service = new LocalInferenceService();
    const result = await service.execute('Test prompt', defaultConfig);

    assert.strictEqual(geminiMock.callCount, 1);
    assert.strictEqual(ollamaMock.callCount, 1);
    assert.strictEqual(result.generatedText, '');
    assert.ok(result.errors.length >= 2, 'Should contain error messages from both providers');
    assert.ok(result.errors.some(e => e.includes('Gemini')), 'Errors should include Gemini failure');
    assert.ok(result.errors.some(e => e.includes('Ollama')), 'Errors should include Ollama failure');
  });

  it('TEST 7: Ollama succeeds directly when config.provider = "ollama" -> Gemini NOT called', async () => {
    const geminiMock = new MockProvider('gemini', () => ({
      generatedText: 'Gemini should not be called',
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      executionTimeMs: 0,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'gemini', modelName: 'gemini-2.5-flash' }
    }));

    const ollamaMock = new MockProvider('ollama', () => ({
      generatedText: 'Direct Ollama response',
      tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      executionTimeMs: 100,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
    }));

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const service = new LocalInferenceService();
    const ollamaConfig: IModelConfig = {
      ...defaultConfig,
      provider: 'ollama',
      modelName: 'qwen2.5-coder:7b'
    };

    const result = await service.execute('Test prompt', ollamaConfig);

    assert.strictEqual(geminiMock.callCount, 0, 'Gemini should NOT be called when provider is explicitly ollama');
    assert.strictEqual(ollamaMock.callCount, 1, 'Ollama should be called');
    assert.strictEqual(result.generatedText, 'Direct Ollama response');
    assert.strictEqual(result.providerInfo.providerName, 'ollama');
  });

  it('TEST 8: Provider loop protection -> same provider never executed twice in one execute() call', async () => {
    let geminiExecutionCount = 0;
    const geminiMock = new MockProvider('gemini', () => {
      geminiExecutionCount++;
      throw new Error('Gemini failure');
    });

    let ollamaExecutionCount = 0;
    const ollamaMock = new MockProvider('ollama', () => {
      ollamaExecutionCount++;
      throw new Error('Ollama failure');
    });

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const service = new LocalInferenceService();
    await service.execute('Test prompt', defaultConfig);

    assert.strictEqual(geminiExecutionCount, 1, 'Gemini executed exactly once');
    assert.strictEqual(ollamaExecutionCount, 1, 'Ollama executed exactly once');
  });

  it('TEST 9: Malformed/empty provider result -> treated according to existing LocalInferenceService error semantics', async () => {
    const geminiMock = new MockProvider('gemini', () => ({
      generatedText: '',
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      executionTimeMs: 100,
      warnings: [],
      errors: ['Empty response from Gemini API'],
      providerInfo: { providerName: 'gemini', modelName: 'gemini-2.5-flash' }
    }));

    const ollamaMock = new MockProvider('ollama', () => ({
      generatedText: '',
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      executionTimeMs: 100,
      warnings: [],
      errors: ['Empty response from Ollama API'],
      providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
    }));

    providerRegistry.registerProvider(geminiMock);
    providerRegistry.registerProvider(ollamaMock);

    const service = new LocalInferenceService();
    const result = await service.execute('Test prompt', defaultConfig);

    assert.strictEqual(result.generatedText, '', 'Should not fabricate output');
    assert.ok(result.errors.length >= 2, 'Should record errors from both providers');
  });

  it('TEST 10: Actual provider metadata -> Gemini success reports Gemini, Ollama fallback reports Ollama', async () => {
    const geminiSuccessMock = new MockProvider('gemini', () => ({
      generatedText: 'Gemini output',
      tokenUsage: { promptTokens: 5, completionTokens: 5, totalTokens: 10 },
      executionTimeMs: 50,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'gemini', modelName: 'gemini-2.5-flash' }
    }));

    providerRegistry.registerProvider(geminiSuccessMock);

    const service = new LocalInferenceService();
    const resGemini = await service.execute('Test prompt', defaultConfig);
    assert.strictEqual(resGemini.providerInfo.providerName, 'gemini');
    assert.strictEqual(resGemini.providerInfo.modelName, 'gemini-2.5-flash');

    // Reset registry and test Ollama failover
    providerRegistry.removeProvider('gemini');
    const geminiFailMock = new MockProvider('gemini', () => {
      throw new Error('Gemini failed');
    });
    const ollamaSuccessMock = new MockProvider('ollama', () => ({
      generatedText: 'Ollama output',
      tokenUsage: { promptTokens: 5, completionTokens: 5, totalTokens: 10 },
      executionTimeMs: 50,
      warnings: [],
      errors: [],
      providerInfo: { providerName: 'ollama', modelName: 'qwen2.5-coder:7b' }
    }));

    providerRegistry.registerProvider(geminiFailMock);
    providerRegistry.registerProvider(ollamaSuccessMock);

    const resOllama = await service.execute('Test prompt', defaultConfig);
    assert.strictEqual(resOllama.providerInfo.providerName, 'ollama');
    assert.strictEqual(resOllama.providerInfo.modelName, 'qwen2.5-coder:7b');
  });
});
