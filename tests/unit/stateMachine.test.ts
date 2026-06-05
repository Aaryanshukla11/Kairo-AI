import * as assert from 'assert';
import { executionStateMachine } from '../../src/core/executionStateMachine/stateMachine';

describe('Execution State Machine (M03-S03-T010) Tests', () => {
  beforeEach(() => {
    executionStateMachine.reset();
  });

  it('should initialize state as Created and track valid transitions', () => {
    assert.strictEqual(executionStateMachine.getCurrentState(), 'Created');

    executionStateMachine.transitionTo('Simulated', 'Dry run virtual workspace checks passed.');
    assert.strictEqual(executionStateMachine.getCurrentState(), 'Simulated');

    executionStateMachine.transitionTo('Approved', 'Security policy gates resolved.');
    assert.strictEqual(executionStateMachine.getCurrentState(), 'Approved');

    const report = executionStateMachine.getTimelineReport();
    assert.strictEqual(report.history.length, 2);
    assert.strictEqual(report.currentState, 'Approved');
  });
});
