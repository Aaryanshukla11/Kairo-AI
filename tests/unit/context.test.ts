import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { ContextEngine } from '../../src/core/context/contextEngine';

describe('Context Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-context-workspace');
  let engine: ContextEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new ContextEngine(tempWorkspace);
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Context Lifecycle', () => {
    it('should build, validate, selector limits, and expire contexts packages', () => {
      const file1 = 'src/app.ts';
      const file2 = 'package.json';
      const abs1 = path.resolve(tempWorkspace, file1);
      const abs2 = path.resolve(tempWorkspace, file2);

      fs.mkdirSync(path.dirname(abs1), { recursive: true });
      fs.writeFileSync(abs1, 'const x = 42; console.log(x);', 'utf8');
      fs.writeFileSync(abs2, JSON.stringify({ name: 'test-project' }), 'utf8');

      const ctx = engine.buildContext({
        filePaths: [file1, file2, file1],
        selection: {
          filePath: file1,
          selectedText: 'const x = 42;',
          startLine: 1,
          endLine: 1
        },
        planner: {
          activePlanId: 'plan-123',
          planStepsCount: 3,
          planStatus: 'PendingApproval'
        },
        execution: {
          graphId: 'graph-456',
          nodesExecuted: 0,
          totalNodes: 4,
          status: 'Pending'
        },
        git: {
          branch: 'main',
          statusSummary: 'Clean',
          modifiedFilesCount: 0
        },
        diagnostics: [],
        limitBytes: 10 * 1024
      });

      assert.ok(ctx.id);
      assert.strictEqual(ctx.workspace.projectName, 'test-project');
      assert.strictEqual(ctx.files.length, 2);

      const appFile = ctx.files.find(f => f.filePath === file1);
      assert.ok(appFile);
      assert.strictEqual(appFile.tokenEstimate, 8);

      const smallCtx = engine.buildContext({
        filePaths: [file1, file2],
        selection: {},
        planner: {},
        execution: {},
        git: {},
        diagnostics: [],
        limitBytes: 30
      });
      assert.ok(smallCtx.files.length < 2);

      engine.expireContext();
      assert.strictEqual(engine.getActiveContext(), null);
    });

    it('should throw validation error when workspace root path is missing', () => {
      const badEngine = new ContextEngine('');
      assert.throws(() => {
        badEngine.buildContext({
          filePaths: [],
          selection: {},
          planner: {},
          execution: {},
          git: {},
          diagnostics: []
        });
      }, /Workspace root path is missing/);
    });
  });
});
