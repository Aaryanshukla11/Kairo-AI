import * as assert from 'assert';
import { workspaceLifecycleManager } from '../../src/core/workspace/workspaceLifecycleManager';
import { gitService } from '../../src/core/git/gitService';
import { vectorStoreService } from '../../src/core/vectorStore/vectorStoreService';

describe('Workspace Lifecycle & Lazy Services Tests', () => {

  it('should track workspace lifecycle state transitions', () => {
    assert.strictEqual(workspaceLifecycleManager.getState(), 'WAITING_FOR_WORKSPACE');
    assert.strictEqual(gitService.state, 'WAITING_FOR_WORKSPACE');
  });

  it('should fallback gracefully instead of throwing exceptions when no workspace exists', () => {
    // Calling GitService when no workspace is open
    const repoInfo = gitService.getRepositoryInfo();
    assert.strictEqual(repoInfo.branch, 'unknown');
    assert.strictEqual(repoInfo.status, 'unknown');

    // Calling VectorStoreService when no workspace is open
    const stats = vectorStoreService.getStats();
    assert.strictEqual(stats.provider, 'None');
    assert.strictEqual(stats.storedCount, 0);
  });

});
