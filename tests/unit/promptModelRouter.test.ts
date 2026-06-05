import * as assert from 'assert';
import { promptModelRouter } from '../../src/core/prompt-model-router';
import { modelRegistry } from '../../src/core/prompt-model-router/registry';

describe('Sprint 2 - Prompt Model Router Tests', () => {

  beforeEach(() => {
    // Reset statuses/priorities and dynamically register fallback models for verification
    modelRegistry.updateModelStatus('qwen2.5-coder:7b', 'Ready');
    modelRegistry.updateModelStatus('qwen2.5-coder:7b-coding', 'Ready');

    modelRegistry.registerModel({
      modelId: 'fallback-planning-model',
      name: 'Fallback Planning Model',
      type: 'Planning Model',
      supportedTasks: ['NEW_PROJECT', 'MODIFY_PROJECT'],
      capabilities: ['reasoning'],
      contextWindow: 16384,
      status: 'Ready',
      priority: 5,
      version: '1.0.0'
    });

    modelRegistry.registerModel({
      modelId: 'fallback-coding-model',
      name: 'Fallback Coding Model',
      type: 'Coding Model',
      supportedTasks: ['DEBUG_PROJECT', 'EXPLAIN_CODE', 'CHAT', 'UNKNOWN'],
      capabilities: ['code-generation'],
      contextWindow: 16384,
      status: 'Ready',
      priority: 5,
      version: '1.0.0'
    });
  });

  it('should route NEW_PROJECT to Planning Model and select qwen2.5-coder:7b', () => {
    const result = promptModelRouter.route('req-id-001', 'NEW_PROJECT');
    
    assert.strictEqual(result.modelType, 'Planning Model');
    assert.strictEqual(result.selectedModel.modelId, 'qwen2.5-coder:7b');
    assert.ok(result.fallbackModels.includes('fallback-planning-model'));
    
    // Verify immutability
    assert.throws(() => {
      (result as any).modelType = 'Coding Model';
    }, /Cannot assign to read only property/);
  });

  it('should fall back to fallback-planning-model if qwen2.5-coder:7b status is set to Error', () => {
    // Simulate error status on primary candidate
    modelRegistry.updateModelStatus('qwen2.5-coder:7b', 'Error');

    const result = promptModelRouter.route('req-id-002', 'NEW_PROJECT');
    
    assert.strictEqual(result.modelType, 'Planning Model');
    assert.strictEqual(result.selectedModel.modelId, 'fallback-planning-model');
    assert.strictEqual(result.fallbackModels.length, 0); // No other healthy candidates left
  });

  it('should route DEBUG_PROJECT to Coding Model and select qwen2.5-coder:7b-coding', () => {
    const result = promptModelRouter.route('req-id-003', 'DEBUG_PROJECT');
    
    assert.strictEqual(result.modelType, 'Coding Model');
    assert.strictEqual(result.selectedModel.modelId, 'qwen2.5-coder:7b-coding');
    assert.ok(result.fallbackModels.includes('fallback-coding-model'));
  });

});
