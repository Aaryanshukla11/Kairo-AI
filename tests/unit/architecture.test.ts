import * as assert from 'assert';
import { ArchitectureAgent } from '../../src/core/agents/architecture/architectureAgent';
import { ArchViolationType, ArchEventType } from '../../src/core/agents/architecture/architectureTypes';
import { architectureValidator } from '../../src/core/agents/architecture/architectureValidator';
import { architectureGraph } from '../../src/core/agents/architecture/architectureGraph';
import { architectureRules } from '../../src/core/agents/architecture/architectureRules';
import { driftDetector } from '../../src/core/agents/architecture/driftDetector';
import { boundaryAnalyzer } from '../../src/core/agents/architecture/boundaryAnalyzer';
import { architectureScorer } from '../../src/core/agents/architecture/architectureScorer';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Architecture Intelligence Agent Tests', () => {
  let agent: ArchitectureAgent;

  before(() => {
    agent = new ArchitectureAgent({
      id: 'architecture-agent',
      name: 'Architecture Agent',
      role: 'Project Structural System QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['architecture', 'boundaries'],
      permissions: ['READ']
    });
  });

  describe('Validation Checks', () => {
    it('should reject requests missing nodes list details', () => {
      assert.throws(() => {
        architectureValidator.validateGraphRequest(null);
      }, /Missing graph request/);

      assert.throws(() => {
        architectureValidator.validateGraphRequest({ nodes: [] });
      }, /incomplete graph - nodes list is empty/i);
    });

    it('should reject invalid metadata configurations lacking parameters', () => {
      assert.throws(() => {
        architectureValidator.validateMetadata(null);
      }, /Corrupted architecture metadata/);

      assert.throws(() => {
        architectureValidator.validateMetadata({});
      }, /strictLayers/);
    });

    it('should reject node graphs referencing unsupported layers', () => {
      const nodes = [{ name: 'src/custom', layer: 'unknown-layer' as any }];
      assert.throws(() => {
        architectureValidator.validateModuleGraph(nodes);
      }, /unknown layer/i);
    });
  });

  describe('Layer violations and drift auditing checks', () => {
    it('should identify layer violations when core imports from extension layer directly', () => {
      const nodes = [
        { name: 'src/core', layer: 'core' as any },
        { name: 'src/extension', layer: 'extension' as any }
      ];
      const edges = [
        { from: 'src/core', to: 'src/extension' }
      ];
      const violations = architectureRules.verifyRules(nodes, edges);
      assert.strictEqual(violations.length, 1);
      assert.strictEqual(violations[0].type, ArchViolationType.LayerViolation);
      assert.ok(violations[0].description.includes('Core module imports from extension'));
    });

    it('should detect drift on unsanctioned folder paths additions', () => {
      const active = ['src/core', 'src/extension', 'src/legacy-junk'];
      const prescribed = ['src/core', 'src/extension'];
      const drifts = driftDetector.detectDrift(active, prescribed);
      assert.strictEqual(drifts.length, 1);
      assert.strictEqual(drifts[0].type, ArchViolationType.ArchDrift);
      assert.ok(drifts[0].description.includes('legacy-junk'));
    });

    it('should calculate technical debt hours based on severity levels', () => {
      const violations = [
        { type: ArchViolationType.LayerViolation, file: 'f1.ts', description: 'desc', severity: 'High' as any },
        { type: ArchViolationType.FeatureCoupling, file: 'f2.ts', description: 'desc', severity: 'Low' as any }
      ];
      const res = architectureScorer.calculateScores(violations, 1);
      assert.strictEqual(res.technicalDebtHours, 13); // High:8 + Low:2 + Drift:3
      assert.strictEqual(res.score, 79); // 95 - High:10 - Low:2 - Drift:4
    });
  });

  describe('Workflows Execution', () => {
    it('should execute ANALYZE_ARCHITECTURE task successfully compiling reports', async () => {
      const task = {
        id: 'task-arch-test-1',
        title: 'Run architecture audits',
        assignedAgentId: 'architecture-agent',
        payload: {
          action: 'ANALYZE_ARCHITECTURE',
          filesMap: {
            'src/core/agents/agentRegistry.ts': 'import { agentRegistry } from "./agentRegistry";'
          }
        },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.result.report.architectureId.startsWith('arch-report-'));
      assert.strictEqual(res.metrics.auditsCount, 1);
    });
  });
});
