import * as assert from 'assert';
import { recoveryEngine } from '../../src/core/recovery/recoveryEngine';
import { failureClassifier } from '../../src/core/recovery/failureClassifier';
import { recoveryAnalyzer } from '../../src/core/recovery/recoveryAnalyzer';
import { checkpointRecoveryManager } from '../../src/core/recovery/checkpointRecovery';
import { rollbackRecoveryManager } from '../../src/core/recovery/rollbackRecovery';
import { workflowRecoveryManager } from '../../src/core/recovery/workflowRecovery';
import { FailureType, RecoveryStrategyType, RecoveryState } from '../../src/core/recovery/recoveryTypes';

describe('Autonomous Recovery Engine Foundation Tests', () => {
  it('should successfully execute recovery pipeline and produce a report', async () => {
    const report = await recoveryEngine.recover({
      failureType: FailureType.ExecutionFailure,
      failureMessage: 'Transient execution worker error detected',
      failedStageId: 'stg-03'
    });

    assert.ok(report.reportId.startsWith('REC-RPT-'));
    assert.strictEqual(report.validationResult.valid, true);
    assert.strictEqual(report.recoveryState, RecoveryState.Recovered);
    assert.ok(report.checkpointUsed);
    assert.ok(report.recoveredTasks.length > 0);
    assert.ok(report.confidence >= 0.5);
  });

  it('should classify failures based on message patterns', () => {
    assert.strictEqual(failureClassifier.classify('Timeout waiting for worker node'), FailureType.Timeout);
    assert.strictEqual(failureClassifier.classify('Permission denied by policy'), FailureType.PolicyFailure);
    assert.strictEqual(failureClassifier.classify('Workspace file read error'), FailureType.WorkspaceFailure);
    assert.strictEqual(failureClassifier.classify('Out of memory error'), FailureType.ResourceFailure);
  });

  it('should select optimal recovery strategies', () => {
    assert.strictEqual(recoveryAnalyzer.selectOptimalStrategy(FailureType.Timeout), RecoveryStrategyType.Retry);
    assert.strictEqual(recoveryAnalyzer.selectOptimalStrategy(FailureType.WorkspaceFailure), RecoveryStrategyType.CheckpointRestore);
    assert.strictEqual(recoveryAnalyzer.selectOptimalStrategy(FailureType.PolicyFailure), RecoveryStrategyType.ManualIntervention);
  });

  it('should restore checkpoints and execute rollbacks without data loss', () => {
    const chk = checkpointRecoveryManager.getLatestCheckpoint('WF-01');
    assert.strictEqual(chk.validationStatus, 'Verified');

    const restored = checkpointRecoveryManager.restoreCheckpoint(chk);
    assert.strictEqual(restored, true);

    const rollbackStatus = rollbackRecoveryManager.performRollback('WF-01', chk.workspaceSnapshot);
    assert.strictEqual(rollbackStatus, 'Success');
  });
});
