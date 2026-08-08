import * as assert from 'assert';
import { runtimeValidationEngine } from '../../src/core/runtimeValidation/runtimeValidationEngine';
import { runtimeCoordinator } from '../../src/core/runtimeValidation/runtimeCoordinator';
import { performanceProfiler } from '../../src/core/runtimeValidation/profiler/performanceProfiler';
import { securityAuditor } from '../../src/core/runtimeValidation/security/securityAuditor';
import { reliabilityEngine } from '../../src/core/runtimeValidation/reliability/reliabilityEngine';
import { runtimeHistory } from '../../src/core/runtimeValidation/runtimeHistory';
import { sandboxValidator } from '../../src/core/runtimeValidation/security/sandboxValidator';
import { filesystemSecurity } from '../../src/core/runtimeValidation/security/filesystemSecurity';
import { leakDetector } from '../../src/core/runtimeValidation/reliability/leakDetector';

describe('Runtime Verification & Performance Integration Tests', () => {

  describe('Runtime Startup & Configuration Loading', () => {
    it('should successfully run all validations and compile overall scores', async () => {
      const res = await runtimeValidationEngine.runAllValidations();
      assert.ok(res.health);
      assert.ok(res.results);
      assert.ok(res.health.overallScore >= 0 && res.health.overallScore <= 100);
      assert.ok(res.health.subsystemHealth.Runtime);
      assert.ok(res.health.subsystemHealth.Inference);
    });
  });

  describe('Inference Pipeline & Tokenizer Verification', () => {
    it('should validate core inference tokenization and cleanups', async () => {
      const provider = runtimeValidationEngine.getProviders().find(p => p.id === 'runtime-provider-wrap');
      assert.ok(provider);
      const valRes = await provider.validate({ timestamp: Date.now() });
      assert.strictEqual(valRes.status, 'Passed');
      assert.ok(valRes.metrics?.tokenizationChecked);
    });
  });

  describe('Performance Profiling Metrics', () => {
    it('should measure startup times, CPU/RAM/VRAM loads and latency averages', async () => {
      const stats = await performanceProfiler.profilePerformance();
      assert.ok(stats.startupTimeMs > 0);
      assert.ok(stats.inferenceLatencyMs > 0);
      assert.ok(stats.tokensPerSec > 0);
      assert.ok(stats.cpuUtilPct >= 0 && stats.cpuUtilPct <= 100);
      assert.ok(stats.ramUtilPct >= 0 && stats.ramUtilPct <= 100);
    });
  });

  describe('Security Audits & Command Sandboxing', () => {
    it('should block path escalations and dangerous CLI command patterns', async () => {
      const root = '/workspace/project';
      const safeCheck = filesystemSecurity.auditPath('/workspace/project/src/index.ts', root);
      assert.strictEqual(safeCheck.isSafe, true);

      const unsafeCheck = filesystemSecurity.auditPath('/etc/passwd', root);
      assert.strictEqual(unsafeCheck.isSafe, false);
      assert.ok(unsafeCheck.reason?.includes('escapes workspace'));

      const cmdSafe = sandboxValidator.validateCommand('git status');
      assert.strictEqual(cmdSafe.isSafe, true);

      const cmdUnsafe = sandboxValidator.validateCommand('rm -rf /');
      assert.strictEqual(cmdUnsafe.isSafe, false);
    });

    it('should aggregate security audits and report violations', async () => {
      const audit = await securityAuditor.performAudit('/workspace/project');
      assert.ok(audit.violations.length > 0, 'Should trigger mock sandbox violations in testing');
      assert.strictEqual(audit.sandboxEnforced, true);
    });
  });

  describe('Reliability & Stress Recovery', () => {
    it('should execute concurrency stress tests and verify watchdog logic', async () => {
      const stability = await reliabilityEngine.executeStabilityTests();
      assert.strictEqual(stability.checkpointRecoveryPassed, true);
      assert.strictEqual(stability.gracefulShutdownPassed, true);
      assert.strictEqual(stability.failures.length, 0);
    });

    it('should detect unreleased resource handles and memory leaks', () => {
      const leaks = leakDetector.auditLeaks();
      assert.strictEqual(leaks.unreleasedHandles, 0);
      assert.strictEqual(leaks.zombieThreads, 0);
      assert.strictEqual(leaks.hasCriticalLeaks, false);
    });
  });

  describe('Runtime Session Replay', () => {
    it('should record, load and reconstruct execution timing traces for debugging', () => {
      const sessionId = 'test-session-999';
      const mockSession = {
        sessionId,
        timestamp: Date.now(),
        prompt: 'Replay prompt test.',
        context: 'System contexts.',
        tokenizerVersion: 'v1',
        modelVersion: 'm1',
        configuration: {},
        timingMs: {
          total: 100,
          promptAssembly: 10,
          tokenization: 10,
          inferenceExecution: 70,
          detokenization: 10
        },
        memoryUsageBytes: {
          start: 50,
          peak: 200,
          end: 60
        },
        runtimeEvents: ['Init test'],
        inferenceOutput: 'Result output.'
      };

      runtimeValidationEngine.recordSessionReplay(mockSession);
      const replayed = runtimeValidationEngine.replaySession(sessionId);
      
      assert.ok(replayed);
      assert.strictEqual(replayed.prompt, 'Replay prompt test.');
      assert.ok(replayed.runtimeEvents.some(e => e.includes('Replay execution completed')));
    });
  });

});
