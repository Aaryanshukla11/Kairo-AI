import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { RuntimeEngine } from '../../src/core/runtime/model/runtimeEngine';
import { ModelState } from '../../src/core/runtime/model/runtimeTypes';
import { DEFAULT_MODELS } from '../../src/core/runtime/model/runtimeConfig';

describe('AI Model Runtime Engine Tests', () => {
  let engine: RuntimeEngine;

  before(() => {
    engine = new RuntimeEngine();
  });

  describe('Model Loading & Inference Lifecycle', () => {
    it('should assert model states loading, switch configurations, and run streaming queries', async () => {
      assert.strictEqual(engine.getModelState(), ModelState.NotLoaded);

      const promptPkg = {
        systemPrompt: '',
        developerPrompt: '',
        userPrompt: 'Test prompt description',
        projectContext: '',
        retrievedContext: '',
        executionContext: '',
        metadata: {},
        estimatedTokens: 10
      };
      
      await assert.rejects(async () => {
        await engine.generate(promptPkg, {});
      }, /Model is not loaded/);

      await engine.loadModel(DEFAULT_MODELS[0]);
      assert.strictEqual(engine.getModelState(), ModelState.Ready);
      assert.strictEqual(engine.getActiveConfig().modelId, 'qwen-2.5-7b-coder');

      let tokenReceived = false;
      const res = await engine.generate(promptPkg, { temperature: 0.7 }, (tok) => {
        tokenReceived = true;
      });

      assert.ok(tokenReceived);
      assert.strictEqual(res.finishReason, 'stop');
      assert.ok(res.response.includes('Mock response'));

      await engine.unloadModel();
      assert.strictEqual(engine.getModelState(), ModelState.NotLoaded);
    });

    it('should throw validation error on empty prompts', async () => {
      await engine.loadModel(DEFAULT_MODELS[0]);
      const emptyPromptPkg = {
        systemPrompt: '',
        developerPrompt: '',
        userPrompt: '',
        projectContext: '',
        retrievedContext: '',
        executionContext: '',
        metadata: {},
        estimatedTokens: 0
      };

      await assert.rejects(async () => {
        await engine.generate(emptyPromptPkg, {});
      }, /Prompt is required and cannot be empty/);

      await engine.unloadModel();
    });
  });
});
