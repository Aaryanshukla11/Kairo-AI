import * as assert from 'assert';
import { DependencyAgent } from '../../src/core/agents/dependency/dependencyAgent';
import { HealthLevel, DepEventType } from '../../src/core/agents/dependency/dependencyTypes';
import { dependencyValidator } from '../../src/core/agents/dependency/dependencyValidator';
import { dependencyGraph } from '../../src/core/agents/dependency/dependencyGraph';
import { dependencyAnalyzer } from '../../src/core/agents/dependency/dependencyAnalyzer';
import { compatibilityEngine } from '../../src/core/agents/dependency/compatibilityEngine';
import { licenseAnalyzer } from '../../src/core/agents/dependency/licenseAnalyzer';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Dependency Intelligence Agent Tests', () => {
  let agent: DependencyAgent;

  before(() => {
    agent = new DependencyAgent({
      id: 'dependency-agent',
      name: 'Dependency Agent',
      role: 'Project Packages Ecosystem QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['dependencies', 'compatibility'],
      permissions: ['READ']
    });
  });

  describe('Validation Checks', () => {
    it('should reject requests missing package manifest JSON details', () => {
      assert.throws(() => {
        dependencyValidator.validateManifest(null);
      }, /Missing package manifest/);

      assert.throws(() => {
        dependencyValidator.validateManifest({});
      }, /Corrupted manifest/);
    });

    it('should reject unknown package managers configurations', () => {
      assert.throws(() => {
        dependencyValidator.validatePackageManager('Cargo');
      }, /Unknown package manager/);
    });

    it('should reject broken dependency graphs referencing undefined nodes', () => {
      const nodes = [{ name: 'A', version: '1.0.0' }];
      const edges = [{ from: 'A', to: 'B', type: 'dependency' as any }];
      assert.throws(() => {
        dependencyValidator.validateGraph(nodes, edges);
      }, /Broken dependency graph/);
    });
  });

  describe('Graph cycle and conflicts scanning checks', () => {
    it('should detect circular dependency loops using depth first traversal', () => {
      const edges = [
        { from: 'A', to: 'B', type: 'import' as any },
        { from: 'B', to: 'C', type: 'import' as any },
        { from: 'C', to: 'A', type: 'import' as any }
      ];
      const cycles = dependencyGraph.findCycles(edges);
      assert.strictEqual(cycles.length, 1);
      assert.deepStrictEqual(cycles[0], ['A', 'B', 'C', 'A']);
    });

    it('should catch version conflicts on identical package entries', () => {
      const nodes = [
        { name: 'react', version: '17.0.2' },
        { name: 'react', version: '18.0.0' }
      ];
      const conflicts = compatibilityEngine.findConflicts(nodes);
      assert.strictEqual(conflicts.length, 2);
    });

    it('should summary license distribution properly', () => {
      const pkgs = ['vite', 'react', 'esbuild'];
      const summary = licenseAnalyzer.parseLicenses(pkgs);
      assert.strictEqual(summary['MIT'], 2);
      assert.strictEqual(summary['Apache-2.0'], 1);
    });
  });

  describe('Workflows Execution', () => {
    it('should execute ANALYZE_DEPENDENCIES task successfully returning health reports', async () => {
      const task = {
        id: 'task-dep-test-1',
        title: 'Run dependency ecosystem scan',
        assignedAgentId: 'dependency-agent',
        payload: {
          action: 'ANALYZE_DEPENDENCIES',
          packageJsonPath: 'package.json'
        },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.result.report.dependencyId.startsWith('dep-report-'));
      assert.strictEqual(res.result.report.healthLevel, HealthLevel.Healthy);
      assert.strictEqual(res.metrics.scansCount, 1);
    });
  });
});
