import * as assert from 'assert';
import { AIKernel, aiKernel } from '../../src/core/ai-kernel/kernel';
import { IKernelStageLog } from '../../src/core/ai-kernel/types';

describe('AI Kernel Unit Tests', () => {
  let kernel: AIKernel;

  beforeEach(() => {
    kernel = new AIKernel();
    kernel.clearHistory();
  });

  describe('Prompt Compilation Pipeline', () => {
    it('should process a raw string prompt and execute all 4 kernel stages', async () => {
      const prompt = 'Create a Calculator web application using HTML, CSS, and JavaScript';
      const compiled = await kernel.processPrompt(prompt, 'c:/test-workspace');

      assert.ok(compiled);
      assert.strictEqual(compiled.rawPrompt, prompt);
      assert.ok(compiled.requestId);
      assert.ok(compiled.timestamp > 0);
      assert.ok(compiled.intent);
      assert.ok(compiled.promptContext);
      assert.ok(compiled.aiRequest);
      assert.ok(Array.isArray(compiled.memories));
      assert.ok(compiled.knowledge);
      assert.ok(compiled.routingDecision);
      assert.ok(compiled.routingDecision.selectedModel);
    });

    it('should process an IAIKernelRequest payload object', async () => {
      const requestPayload = {
        rawPrompt: 'Create Express REST API for managing todo items',
        workspacePath: 'c:/express-todo',
        requestId: 'custom-req-001'
      };

      const compiled = await kernel.processPrompt(requestPayload);

      assert.strictEqual(compiled.requestId, 'custom-req-001');
      assert.strictEqual(compiled.rawPrompt, requestPayload.rawPrompt);
      assert.strictEqual(compiled.promptContext.projectInfo.type, 'Web/API');
    });

    it('should generate structured stage logs for every stage in exact sequence', async () => {
      const prompt = 'Build a React dashboard application';
      const compiled = await kernel.processPrompt(prompt);

      const logs = compiled.kernelLogs;
      assert.strictEqual(logs.length, 5, 'Expected 5 stage logs (4 engine stages + handoff)');

      assert.strictEqual(logs[0].stage, 'CONTEXT_BUILDER');
      assert.strictEqual(logs[0].status, 'SUCCESS');
      assert.ok(logs[0].details.intent);

      assert.strictEqual(logs[1].stage, 'MEMORY_ENGINE');
      assert.strictEqual(logs[1].status, 'SUCCESS');
      assert.ok(typeof logs[1].details.memoriesRetrievedCount === 'number');

      assert.strictEqual(logs[2].stage, 'KNOWLEDGE_ENGINE');
      assert.strictEqual(logs[2].status, 'SUCCESS');
      assert.ok(typeof logs[2].details.indexedFilesCount === 'number');

      assert.strictEqual(logs[3].stage, 'MODEL_ROUTER');
      assert.strictEqual(logs[3].status, 'SUCCESS');
      assert.ok(logs[3].details.selectedModel);

      assert.strictEqual(logs[4].stage, 'ORCHESTRATOR_HANDOFF');
      assert.strictEqual(logs[4].status, 'SUCCESS');
    });

    it('should notify log subscribers when stages execute', async () => {
      const receivedLogs: IKernelStageLog[] = [];
      const unsubscribe = kernel.subscribe((log) => {
        receivedLogs.push(log);
      });

      await kernel.processPrompt('Scaffold a TypeScript CLI app');

      assert.strictEqual(receivedLogs.length, 5);
      assert.strictEqual(receivedLogs[0].stage, 'CONTEXT_BUILDER');
      assert.strictEqual(receivedLogs[4].stage, 'ORCHESTRATOR_HANDOFF');

      unsubscribe();
    });

    it('should track last compiled request and support clearing history', async () => {
      assert.strictEqual(kernel.getLastCompiledRequest(), null);

      await kernel.processPrompt('Create simple HTML page');

      const last = kernel.getLastCompiledRequest();
      assert.ok(last);
      assert.strictEqual(last.rawPrompt, 'Create simple HTML page');

      kernel.clearHistory();
      assert.strictEqual(kernel.getLastCompiledRequest(), null);
      assert.strictEqual(kernel.getLogs().length, 0);
    });

    it('should throw an error for MODIFY_PROJECT if no workspace path is open', async () => {
      await assert.rejects(
        kernel.processPrompt('add feature to search patient histories in the dashboard module', undefined),
        /Workspace Detection Error: No workspace folder is open/
      );
    });
  });
});
