import * as assert from 'assert';
import * as path from 'path';
import { isIgnored } from '../../src/core/workspace/ignoreRules';
import { workspaceEngine } from '../../src/core/workspace/workspaceEngine';

describe('Workspace Intelligence Tests', () => {
  describe('Ignore Rules', () => {
    it('should correctly identify ignored paths', () => {
      assert.strictEqual(isIgnored('node_modules'), true);
      assert.strictEqual(isIgnored('node_modules/lodash'), true);
      assert.strictEqual(isIgnored('dist'), true);
      assert.strictEqual(isIgnored('.git/config'), true);
      assert.strictEqual(isIgnored('src/components/Login.tsx'), false);
    });
  });

  describe('Workspace Summary Detection', () => {
    it('should fail with error if workspace path does not exist', () => {
      assert.throws(() => {
        workspaceEngine.getSummary(path.join(__dirname, 'non-existent-path-for-testing'));
      }, /Workspace Not Found/);
    });

    it('should successfully analyze this project workspace', () => {
      const projectRoot = path.resolve(__dirname, '../../');
      const summary = workspaceEngine.getSummary(projectRoot);

      assert.ok(summary);
      assert.ok(summary.projectName);
      assert.strictEqual(summary.framework, 'Vite');
      assert.strictEqual(summary.language, 'TypeScript');
      assert.strictEqual(summary.packageManager, 'npm');
      assert.strictEqual(summary.buildTool, 'Vite');
      assert.strictEqual(summary.gitEnabled, true);
    });
  });
});
