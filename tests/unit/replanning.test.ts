import * as assert from 'assert';
import { replanningEngine } from '../../src/core/replanning/replanningEngine';
import { changeDetector } from '../../src/core/replanning/changeDetector';
import { impactAnalyzer } from '../../src/core/replanning/impactAnalyzer';
import { workflowComparator } from '../../src/core/replanning/workflowComparator';
import { conflictResolver } from '../../src/core/replanning/conflictResolver';
import { replanningValidator } from '../../src/core/replanning/replanningValidator';
import { ReplanTriggerType, ReplanStrategyType } from '../../src/core/replanning/replanningTypes';

describe('Dynamic Replanning Engine Foundation Tests', () => {
  it('should successfully execute replanning pipeline and produce a report', async () => {
    const report = await replanningEngine.replan({
      triggerType: ReplanTriggerType.TaskFailure,
      failedSourceId: 'stg-03',
      strategy: ReplanStrategyType.Partial
    });

    assert.ok(report.reportId.startsWith('RPL-RPT-'));
    assert.strictEqual(report.validationResult.valid, true);
    assert.ok(report.impact.preservedTaskIds.length > 0);
    assert.ok(report.impact.affectedTaskIds.length > 0);
    assert.ok(report.updatedExecutionOrder.length > 0);
    assert.ok(report.confidence >= 0.5);
  });

  it('should detect triggers correctly', () => {
    const trigger = changeDetector.detectChange({
      triggerType: ReplanTriggerType.WorkspaceChange,
      failedSourceId: 'stg-02',
      reason: 'File modified on disk'
    });

    assert.ok(trigger.id.startsWith('trig-'));
    assert.strictEqual(trigger.type, ReplanTriggerType.WorkspaceChange);
    assert.strictEqual(trigger.sourceId, 'stg-02');
  });

  it('should preserve completed work during impact analysis', () => {
    const trigger = changeDetector.detectChange({
      triggerType: ReplanTriggerType.TaskFailure,
      failedSourceId: 'stg-03'
    });

    const impact = impactAnalyzer.analyzeImpact(trigger, ['stg-01', 'stg-02', 'stg-03', 'stg-04', 'stg-05']);
    assert.deepStrictEqual(impact.preservedTaskIds, ['stg-01', 'stg-02']);
    assert.deepStrictEqual(impact.affectedTaskIds, ['stg-03', 'stg-04', 'stg-05']);
  });

  it('should calculate execution delta between old and updated graphs', () => {
    const delta = workflowComparator.compareWorkflows(
      ['stg-01', 'stg-02', 'stg-03'],
      ['stg-01', 'stg-02', 'stg-03-replanned', 'stg-04-new'],
      ['stg-01', 'stg-02']
    );

    assert.deepStrictEqual(delta.preservedTasks, ['stg-01', 'stg-02']);
    assert.ok(delta.addedTasks.includes('stg-04-new'));
  });

  it('should resolve execution conflicts', () => {
    const conflicts = conflictResolver.resolveConflicts(['stg-03', 'stg-04']);
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].resolved, true);
  });

  it('should validate completed work preservation and reject duplicate tasks', () => {
    const preserved = ['stg-01', 'stg-02'];

    // Valid graph containing preserved tasks
    const validRes = replanningValidator.validate(preserved, ['stg-01', 'stg-02', 'stg-03-replanned']);
    assert.strictEqual(validRes.valid, true);

    // Invalid graph discarding completed task stg-01
    const invalidRes1 = replanningValidator.validate(preserved, ['stg-02', 'stg-03-replanned']);
    assert.strictEqual(invalidRes1.valid, false);
    assert.ok(invalidRes1.errors.some(e => e.includes('Preserved completed task/stage stg-01 was missing')));

    // Invalid graph containing duplicate task
    const invalidRes2 = replanningValidator.validate(preserved, ['stg-01', 'stg-01', 'stg-02']);
    assert.strictEqual(invalidRes2.valid, false);
    assert.ok(invalidRes2.errors.some(e => e.includes('Duplicate task/stage detected')));
  });
});
