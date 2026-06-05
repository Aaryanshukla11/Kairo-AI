import * as assert from 'assert';
import { ToolEngine } from '../../src/core/toolCalling/toolEngine';
import { toolRegistry } from '../../src/core/toolCalling/toolRegistry';
import { ToolStatus } from '../../src/core/toolCalling/toolTypes';

describe('Tool Calling Engine Tests', () => {
  let engine: ToolEngine;

  before(() => {
    engine = new ToolEngine();
  });

  describe('Registry & Schema Validations', () => {
    it('should list registered tools and fetch schemas correctly', () => {
      const tools = toolRegistry.list();
      assert.ok(tools.length >= 5);
      
      const fileTool = toolRegistry.get('filesystem-read-file');
      assert.ok(fileTool);
      assert.strictEqual(fileTool?.name, 'Read Workspace File');
      assert.strictEqual(fileTool?.category, 'Filesystem');
    });

    it('should validate schemas and reject invalid argument names/types', async () => {
      const res1 = await engine.executeTool('filesystem-read-file', {});
      assert.strictEqual(res1.success, false);
      assert.ok(res1.error?.includes('Missing required argument'));

      const res2 = await engine.executeTool('filesystem-read-file', { path: 12345 });
      assert.strictEqual(res2.success, false);
      assert.ok(res2.error?.includes('Type mismatch'));

      const res3 = await engine.executeTool('filesystem-read-file', { path: 'file.txt', extra: true });
      assert.strictEqual(res3.success, false);
      assert.ok(res3.error?.includes('Unknown argument'));
    });

    it('should reject executions on disabled tools', async () => {
      toolRegistry.disable('git-status');
      
      const res = await engine.executeTool('git-status', {});
      assert.strictEqual(res.success, false);
      assert.ok(res.error?.includes('disabled'));

      toolRegistry.enable('git-status');
    });
  });

  describe('Tool Execution Routing', () => {
    it('should route execution to correct adapter and return success payload', async () => {
      const res = await engine.executeTool('filesystem-read-file', { path: 'c:/src/index.ts' });
      assert.strictEqual(res.success, true);
      assert.ok(res.result.content.includes('Mock file content of'));

      const logs = engine.getHistory();
      assert.ok(logs.length > 0);
      assert.strictEqual(logs[logs.length - 1].toolId, 'filesystem-read-file');
    });
  });
});
