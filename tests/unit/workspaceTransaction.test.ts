import * as assert from 'assert';
import { transactionEngine } from '../../src/core/workspaceTransaction/transactionEngine';
import { transactionManager } from '../../src/core/workspaceTransaction/transactionManager';
import { transactionMetrics } from '../../src/core/workspaceTransaction/transactionMetrics';

describe('Workspace Snapshot & Transaction Engine (M03-S03-T006) Tests', () => {
  it('should execute transactional action successfully and commit', async () => {
    const res = await transactionEngine.executeTransactional(
      'tx-1',
      ['src/core/base.ts'],
      async () => {
        return 'success';
      }
    );
    assert.strictEqual(res.result, 'success');
    assert.strictEqual(res.report.state, 'Committed');
    assert.ok(res.report.durationMs >= 0);
  });

  it('should rollback transaction on action throwing error', async () => {
    try {
      await transactionEngine.executeTransactional(
        'tx-2',
        ['src/core/base.ts'],
        async () => {
          throw new Error('Action failed');
        }
      );
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.strictEqual(err.message, 'Action failed');
    }

    const stats = transactionMetrics.getStats();
    assert.ok(stats.totalRollbacks >= 1);
  });
});
