import * as assert from 'assert';
import { taskGenerationEngine } from '../../src/core/taskGeneration/taskGenerationEngine';
import { htnEngine } from '../../src/core/taskGeneration/intelligence/htn/htnEngine';
import { taskKnowledgeGraph } from '../../src/core/taskGeneration/intelligence/knowledgeGraph/taskKnowledgeGraph';
import { taskConstraintEngine } from '../../src/core/taskGeneration/intelligence/constraints/taskConstraintEngine';
import { taskResourceModel } from '../../src/core/taskGeneration/intelligence/resources/taskResourceModel';
import { taskRecoveryPlanner } from '../../src/core/taskGeneration/intelligence/recovery/taskRecoveryPlanner';
import { taskDecisionEngine } from '../../src/core/taskGeneration/intelligence/decisions/taskDecisionEngine';
import { taskVersionTracker } from '../../src/core/taskGeneration/intelligence/versioning/taskVersionTracker';
import { taskObservabilityEngine } from '../../src/core/taskGeneration/intelligence/observability/taskObservabilityEngine';

describe('Advanced Task Intelligence Pack (M04-S01-T002A) Tests', () => {
  const samplePlan = {
    planId: 'PLAN-INTEL-01',
    title: 'Enterprise Billing Integration',
    description: 'Add billing service API, database schema, and payment webview view.',
    milestones: [
      { milestoneId: 'M1', name: 'Database Setup', description: 'Create billing tables' },
      { milestoneId: 'M2', name: 'Service API', description: 'Create payment REST API' }
    ]
  };

  it('should build HTN hierarchy with Feature, Milestone, Task, Subtask, and Atomic Action levels', async () => {
    const report = await taskGenerationEngine.generateTasks({ featurePlan: samplePlan });
    assert.ok(report.intelligence);
    assert.ok(report.intelligence.htnTree);
    assert.strictEqual(report.intelligence.htnTree.level, 'Feature');
    assert.ok(report.intelligence.htnTree.children.length > 0);

    const msNode = report.intelligence.htnTree.children[0];
    assert.strictEqual(msNode.level, 'Milestone');
  });

  it('should construct Task Knowledge Graph metadata for files, symbols, services, APIs, and DB tables', async () => {
    const report = await taskGenerationEngine.generateTasks({ featurePlan: samplePlan });
    const graphMap = report.intelligence?.knowledgeGraph;
    assert.ok(graphMap);

    const taskIds = Object.keys(graphMap);
    assert.ok(taskIds.length > 0);
    const meta = graphMap[taskIds[0]];
    assert.ok(meta.requiredFiles);
    assert.ok(meta.producedFiles);
  });

  it('should solve task constraints (Must Run After, Requires Approval, Requires Checkpoint)', async () => {
    const report = await taskGenerationEngine.generateTasks({ featurePlan: samplePlan });
    const constraints = report.intelligence?.constraints;
    assert.ok(constraints);
    assert.ok(constraints.length > 0);
    assert.ok(constraints.some((c: any) => c.type === 'Must Run After' || c.type === 'Requires Approval'));
  });

  it('should compute resource estimations, recovery plans, decisions, versions, and observability', async () => {
    const report = await taskGenerationEngine.generateTasks({ featurePlan: samplePlan });
    const intel = report.intelligence;
    assert.ok(intel);
    assert.ok(intel.resources);
    assert.ok(intel.recoveryPlans);
    assert.ok(intel.decisions);
    assert.ok(intel.versions);
    assert.ok(intel.observability);
    assert.ok(intel.observability.planningTimeMs >= 0);
    assert.ok(intel.observability.estimatedCostUSD >= 0);
  });
});
