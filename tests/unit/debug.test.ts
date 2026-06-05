import * as assert from 'assert';
import { DebugAgent } from '../../src/core/agents/debug/debugAgent';
import { DebugType, ConfidenceLevel, DebugEventType } from '../../src/core/agents/debug/debugTypes';
import { debugValidator } from '../../src/core/agents/debug/debugValidator';
import { stackTraceAnalyzer } from '../../src/core/agents/debug/stackTraceAnalyzer';
import { logAnalyzer } from '../../src/core/agents/debug/logAnalyzer';
import { hypothesisEngine } from '../../src/core/agents/debug/hypothesisEngine';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Debug Agent Tests', () => {
  let agent: DebugAgent;

  before(() => {
    agent = new DebugAgent({
      id: 'debug-agent',
      name: 'Debug Agent',
      role: 'Project Failures & Root-Cause QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['debugging', 'diagnostics'],
      permissions: ['READ']
    });
  });

  describe('Validation Checks', () => {
    it('should reject missing raw diagnostics data objects', () => {
      assert.throws(() => {
        debugValidator.validateDiagnostics(null);
      }, /Missing diagnostics context data/);
    });

    it('should reject empty raw execution logs list arrays', () => {
      assert.throws(() => {
        debugValidator.validateLogs([]);
      }, /Corrupted logs/);
    });

    it('should reject unknown languages or unsupported runtimes', () => {
      assert.throws(() => {
        debugValidator.validateEnvironment('COBOL', 'node');
      }, /Unknown language/);

      assert.throws(() => {
        debugValidator.validateEnvironment('typescript', 'JVM');
      }, /Unsupported runtime/);
    });
  });

  describe('Stack Trace & Log Analyzers', () => {
    it('should parse stacks extracting methods, files, lines, and columns', () => {
      const trace = 'Error: Fail\n  at Registry.run (src/core/reg.ts:45:12)\n  at Router.dispatch (src/ext/route.ts:550:8)';
      const frames = stackTraceAnalyzer.parse(trace);
      assert.strictEqual(frames.length, 2);
      
      assert.strictEqual(frames[0].methodName, 'Registry.run');
      assert.strictEqual(frames[0].filePath, 'src/core/reg.ts');
      assert.strictEqual(frames[0].line, 45);
      assert.strictEqual(frames[0].column, 12);
    });

    it('should identify critical keywords and error occurrences inside logs list', () => {
      const logs = [
        '[info] Start process thread',
        '[critical] Fatal memory heap limit boundary exceeded',
        '[error] DB connection timeout failure error exception.'
      ];
      const audit = logAnalyzer.analyze(logs);
      assert.strictEqual(audit.hasCritical, true);
      assert.strictEqual(audit.errorMessages.length, 1);
    });
  });

  describe('Hypothesis engine and ranking', () => {
    it('should rank hypotheses listing likelihood ranks', () => {
      const list = hypothesisEngine.generate('TypeError', 'message details', true);
      assert.strictEqual(list.length, 3);
      assert.strictEqual(list[0].rank, 1);
      assert.strictEqual(list[0].confidence, ConfidenceLevel.High);
    });
  });

  describe('Workflows Execution', () => {
    it('should execute ANALYZE_FAILURE task successfully generating reports details', async () => {
      const mockDiagnostics = {
        errorName: 'TypeError',
        message: "Cannot read property 'id' of null",
        stackTrace: 'TypeError: properties of null\n  at Object.get (src/core/utils.ts:12:4)',
        language: 'typescript',
        runtime: 'node',
        logs: ['[info] dispatching event', '[error] crash occurred during task']
      };

      const task = {
        id: 'task-debug-test-1',
        title: 'Run debug failure analysis',
        assignedAgentId: 'debug-agent',
        payload: {
          action: 'ANALYZE_FAILURE',
          diagnostics: mockDiagnostics
        },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.result.report.debugId.startsWith('dbg-report-'));
      assert.strictEqual(res.result.report.confidenceScore, 80); // 80 - 0 modifiers = 80
      assert.strictEqual(res.result.report.alternativeHypotheses.length, 3);
    });
  });
});
