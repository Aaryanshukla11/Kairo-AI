import * as assert from 'assert';
import { RefactoringAgent } from '../../src/core/agents/refactoring/refactoringAgent';
import { CodeSmell, RefactoringType } from '../../src/core/agents/refactoring/refactoringTypes';
import { refactoringValidator } from '../../src/core/agents/refactoring/refactoringValidator';
import { refactoringAnalyzer } from '../../src/core/agents/refactoring/refactoringAnalyzer';
import { refactoringStrategies } from '../../src/core/agents/refactoring/refactoringStrategies';
import { behaviorVerifier } from '../../src/core/agents/refactoring/behaviorVerifier';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Refactoring Agent Tests', () => {
  let agent: RefactoringAgent;

  before(() => {
    agent = new RefactoringAgent({
      id: 'refactoring-agent',
      name: 'Refactoring Agent',
      role: 'Project Code Quality & Structure QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['refactoring', 'optimization'],
      permissions: ['READ', 'WRITE']
    });
  });

  describe('Validation Rules Checks', () => {
    it('should reject requests with missing files parameter list', () => {
      assert.throws(() => {
        refactoringValidator.validateAnalysisRequest(null);
      }, /Missing analysis request body/);

      assert.throws(() => {
        refactoringValidator.validateAnalysisRequest({ files: [] });
      }, /files list is empty/);
    });

    it('should reject behavior-changing refactors', () => {
      assert.throws(() => {
        refactoringValidator.validatePlan({ preservesBehavior: false, hasDependencyCycles: false, associatedTests: ['test'] });
      }, /Rejected behavior-changing/);
    });

    it('should reject plans without target tests target paths list', () => {
      assert.throws(() => {
        refactoringValidator.validatePlan({ preservesBehavior: true, hasDependencyCycles: false, associatedTests: [] });
      }, /missing tests verification target/);
    });
  });

  describe('Smell Analyzer & Strategies Mapping', () => {
    it('should flag Deep Nesting smell issues on nested brace scopes', () => {
      const code = '{\n  {\n    {\n      {\n        {\n          console.log("nest");\n        }\n      }\n    }\n  }\n}';
      const issues = refactoringAnalyzer.analyzeFile('src/temp.ts', code);
      assert.ok(issues.some(i => i.smell === CodeSmell.DeepNesting));
    });

    it('should flag Magic Numbers check matching assignment regexes', () => {
      const code = 'const threshold = 1000;';
      const issues = refactoringAnalyzer.analyzeFile('src/temp.ts', code);
      assert.ok(issues.some(i => i.smell === CodeSmell.MagicNumbers));
    });

    it('should map GodObject smell to ExtractClass strategy action', () => {
      const strategy = refactoringStrategies.mapSmellToStrategy(CodeSmell.GodObject);
      assert.strictEqual(strategy, RefactoringType.ExtractClass);
    });

    it('should map LongMethod smell to ExtractMethod strategy action', () => {
      const strategy = refactoringStrategies.mapSmellToStrategy(CodeSmell.LongMethod);
      assert.strictEqual(strategy, RefactoringType.ExtractMethod);
    });
  });

  describe('Behavior Preservation verifier', () => {
    it('should assert true if export symbols remain identical', () => {
      const orig = 'export class Helper {}';
      const prop = 'export class Helper { run() {} }';
      const res = behaviorVerifier.verifyPreservation(orig, prop);
      assert.strictEqual(res.preserves, true);
    });

    it('should assert false if original export signature is mutated/missing', () => {
      const orig = 'export class Target {}';
      const prop = 'export class MutatedName {}';
      const res = behaviorVerifier.verifyPreservation(orig, prop);
      assert.strictEqual(res.preserves, false);
      assert.ok(res.reason?.includes('violation'));
    });
  });

  describe('Workflows Execution', () => {
    it('should run static analysis scans successfully returning report details', async () => {
      // Mock vscode workspaceFolders mapping
      const workspaceBackup = require('vscode').workspace;
      Object.defineProperty(workspaceBackup, 'workspaceFolders', {
        get: () => [{ name: 'SASTA ANTIGRAVITY' }],
        configurable: true
      });

      const task = {
        id: 'task-dispatch-refactor-1',
        title: 'Run code smells analysis',
        assignedAgentId: 'refactoring-agent',
        payload: {
          action: 'ANALYZE_SMELLS',
          files: ['src/core/agents/agentRegistry.ts']
        },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.result.report.refactoringId.startsWith('ref-scan-'));
      assert.ok(res.result.report.maintainabilityGain >= 0);
      assert.strictEqual(res.metrics.analysesCount, 1);
    });
  });
});
