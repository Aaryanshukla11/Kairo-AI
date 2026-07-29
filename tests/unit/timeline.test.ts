import * as assert from 'assert';
import { plannerEngine } from '../../src/core/planner';
import { timelineEngine, TimelineStepStatus } from '../../src/core/timeline';

describe('Timeline Engine Tests', () => {
  it('should fail to generate timeline without a valid plan', () => {
    assert.throws(() => {
      timelineEngine.generateTimeline(null as any);
    }, /Timeline cannot exist without a valid plan/);
  });

  it('should generate timeline correctly from a valid plan', () => {
    const plan = plannerEngine.generatePlan('Test project prompt');
    assert.ok(plan);
    assert.ok(plan.id);

    const timeline = timelineEngine.generateTimeline(plan);
    assert.ok(timeline);
    assert.strictEqual(timeline.planId, plan.id);
    assert.strictEqual(timeline.steps.length, plan.tasks.length);

    // Verify all steps are mapped and have required properties
    timeline.steps.forEach((step, index) => {
      assert.ok(step.id);
      assert.ok(step.title);
      assert.ok(step.status);
      assert.strictEqual(step.stepNumber, index + 1);
      assert.strictEqual(step.status, TimelineStepStatus.Waiting);
    });
  });

  it('should update step status correctly', () => {
    const plan = plannerEngine.generatePlan('Test login feature');
    const timeline = timelineEngine.generateTimeline(plan);
    const firstStep = timeline.steps[0];

    assert.strictEqual(firstStep.status, TimelineStepStatus.Waiting);

    const updated = timelineEngine.updateStepStatus(timeline.id, firstStep.id, TimelineStepStatus.Running);
    assert.strictEqual(updated.steps[0].status, TimelineStepStatus.Running);
  });
});
