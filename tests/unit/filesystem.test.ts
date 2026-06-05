import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { FilesystemEngine } from '../../src/core/filesystem/filesystemEngine';
import { isProtectedPath } from '../../src/core/filesystem/ignoreRules';

describe('Filesystem Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-test-workspace');
  let engine: FilesystemEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new FilesystemEngine(tempWorkspace);
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Path Protection & Normalization', () => {
    it('should identify protected directories correctly', () => {
      assert.strictEqual(isProtectedPath('node_modules/lodash/index.js'), true);
      assert.strictEqual(isProtectedPath('.git/config'), true);
      assert.strictEqual(isProtectedPath('src/App.tsx'), false);
    });

    it('should throw traversal violation error when path escapes root', () => {
      assert.throws(() => {
        engine.exists('../outside-workspace.txt');
      }, /Security violation: Path.*lies outside the workspace root/);
    });
  });

  describe('Read & Write APIs', () => {
    it('should write, read, check existence, and delete files', () => {
      const testFile = 'test-file.txt';
      const content = 'Hello Filesystem Engine';

      engine.createFile(testFile, content);
      assert.strictEqual(engine.exists(testFile), true);

      const readContent = engine.readFile(testFile);
      assert.strictEqual(readContent, content);

      const newContent = 'Updated Hello';
      engine.updateFile(testFile, newContent);
      assert.strictEqual(engine.readFile(testFile), newContent);

      const stat = engine.stat(testFile);
      assert.strictEqual(stat.isFile, true);
      assert.ok(stat.size > 0);

      engine.deleteFile(testFile);
      assert.strictEqual(engine.exists(testFile), false);
    });

    it('should reject modifying protected paths', () => {
      assert.throws(() => {
        engine.createFile('.git/mock-config', 'bad');
      }, /Operation rejected: Path.*is within a protected directory/);
    });
  });
});
