import * as assert from 'assert';
import { localInferenceService, providerRegistry, IModelConfig } from '../../src/core/inference';

describe('Sprint 4A - Local Inference Service Tests', () => {

  const sampleConfig: IModelConfig = {
    provider: 'mock-llama-cpp',
    modelName: 'Qwen-Coder-GGUF',
    modelPath: 'models/qwen.gguf',
    contextLength: 2048,
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxTokens: 512,
    gpuLayers: 32,
    threadCount: 4,
    streamingEnabled: true
  };

  it('should resolve and register providers dynamically and execute successfully', async () => {
    const tokens: string[] = [];
    const result = await localInferenceService.execute(
      'Write a function',
      sampleConfig,
      (tok) => tokens.push(tok)
    );

    assert.strictEqual(result.errors.length, 0);
    assert.ok(result.generatedText.includes('mock-llama-cpp'));
    assert.strictEqual(result.providerInfo.providerName, 'mock-llama-cpp');
    assert.strictEqual(tokens.length, 1);
    
    // Check registered list
    const list = providerRegistry.listProviders();
    assert.ok(list.includes('mock-llama-cpp'));

    // Check immutability
    assert.throws(() => {
      (result as any).generatedText = 'Modified';
    }, /Cannot assign to read only property/);
  });

  it('should abort execution and return errors array if cancellation occurs', async () => {
    const extController = new AbortController();
    extController.abort(); // Cancel immediately

    const result = await localInferenceService.execute(
      'Cancel this prompt',
      sampleConfig,
      undefined,
      extController.signal
    );

    assert.strictEqual(result.generatedText, '');
    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].includes('cancelled') || result.errors[0].includes('cancelled'));
  });

});
