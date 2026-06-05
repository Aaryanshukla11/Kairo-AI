import * as assert from 'assert';
import * as path from 'path';
import { GitEngine } from '../../src/core/git/gitEngine';
import { gitValidator } from '../../src/core/git/gitValidator';

describe('Git Engine Tests', () => {
  const workspaceRoot = path.resolve(__dirname, '../..');
  let engine: GitEngine;

  before(() => {
    engine = new GitEngine(workspaceRoot);
  });

  describe('Repository Detection & Validations', () => {
    it('should successfully detect valid git repository root', () => {
      assert.doesNotThrow(() => {
        gitValidator.validateRepository(workspaceRoot);
      });
    });

    it('should throw error when target folder has no .git folder', () => {
      assert.throws(() => {
        gitValidator.validateRepository(path.resolve(workspaceRoot, 'src'));
      }, /is not a valid Git repository/);
    });

    it('should reject empty commit messages', () => {
      assert.throws(() => {
        gitValidator.validateCommitMessage('');
      }, /Commit message cannot be empty/);
    });
  });

  describe('Git Repository Metadata APIs', () => {
    it('should fetch repository info metrics details', () => {
      const info = engine.getRepositoryInfo();
      assert.strictEqual(info.root, workspaceRoot);
      assert.ok(info.branch);
      assert.strictEqual(typeof info.isDirty, 'boolean');
    });

    it('should retrieve git branch and status models', () => {
      const status = engine.getStatus();
      assert.ok(status.branch);
      assert.strictEqual(typeof status.isDirty, 'boolean');
      assert.ok(Array.isArray(status.changedFiles));
    });

    it('should generate diff previews details', () => {
      // Diff preview should return string without exceptions
      const diff = engine.getDiff();
      assert.strictEqual(typeof diff, 'string');
    });

    it('should return recent commit log history', () => {
      const history = engine.getHistory(3);
      assert.ok(Array.isArray(history));
      if (history.length > 0) {
        assert.ok(history[0].hash);
        assert.ok(history[0].message);
      }
    });
  });
});
