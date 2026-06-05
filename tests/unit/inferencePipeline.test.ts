import * as assert from 'assert';
import { inferencePipeline } from '../../src/core/inference/inferencePipeline';
import { inferenceSessionManager } from '../../src/core/inference/inferenceSession';
import { requestCompiler } from '../../src/core/inference/requestCompiler';
import { SessionState } from '../../src/core/inference/inferenceTypes';

describe('Inference Pipeline Tests', () => {
  beforeEach(() => {
    inferenceSessionManager.clear();
  });

  describe('Prompt Compilation', () => {
    it('should compile request template correctly', () => {
      const mockReq = {
        requestId: 'r1',
        sessionId: 's1',
        modelId: 'm1',
        prompt: 'Calculate fibonacci',
        systemPrompt: 'You are a coder',
        workspaceContext: 'File: main.ts'
      };

      const compiled = requestCompiler.compile(mockReq);
      assert.ok(compiled.includes('System: You are a coder'));
      assert.ok(compiled.includes('Context:\nFile: main.ts'));
      assert.ok(compiled.includes('User: Calculate fibonacci'));
    });
  });

  describe('Inference Queue & Execution', () => {
    it('should queue and resolve a mock inference execution request', async () => {
      const mockReq = {
        requestId: 'r2',
        sessionId: 's2',
        modelId: 'qwen2.5-coder:7b',
        prompt: 'Search list algorithm'
      };

      let tokenReceived = false;
      const res = await inferencePipeline.run(mockReq, true, (tok) => {
        tokenReceived = true;
      });

      assert.ok(tokenReceived);
      assert.strictEqual(res.finishReason, 'stop');
      assert.ok(res.text.includes('[Pipeline Mock Response]'));

      // Check session status
      const session = inferencePipeline.getSession('s2');
      assert.ok(session);
      assert.strictEqual(session.state, SessionState.Completed);
    });

    it('should validate inputs, throwing errors on missing prompts', async () => {
      const invalidReq = {
        requestId: 'r3',
        sessionId: 's3',
        modelId: 'qwen2.5-coder:7b',
        prompt: ''
      };

      await assert.rejects(async () => {
        await inferencePipeline.run(invalidReq, true);
      }, /Prompt is required and cannot be empty/);
    });
  });
});
