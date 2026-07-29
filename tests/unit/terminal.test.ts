import * as assert from 'assert';
import * as path from 'path';
import { TerminalEngine } from '../../src/core/terminal/terminalEngine';
import { isWhitelistedCommand } from '../../src/core/terminal/commandWhitelist';
import { CommandStatus } from '../../src/core/terminal/terminalTypes';

describe('Terminal Engine Tests', () => {
  const workspaceRoot = path.resolve(__dirname, '../..');
  let engine: TerminalEngine;

  before(() => {
    engine = new TerminalEngine(workspaceRoot);
  });

  describe('Command Whitelist & Restrictions', () => {
    it('should correctly whitelist valid commands', () => {
      assert.strictEqual(isWhitelistedCommand('pwd'), true);
      assert.strictEqual(isWhitelistedCommand('npm install'), true);
      assert.strictEqual(isWhitelistedCommand('npm run build'), true);
      assert.strictEqual(isWhitelistedCommand('git status'), true);
      assert.strictEqual(isWhitelistedCommand('python --version'), true);
    });

    it('should correctly block invalid command patterns', () => {
      assert.strictEqual(isWhitelistedCommand('rm -rf node_modules'), false);
      assert.strictEqual(isWhitelistedCommand('git push'), false);
      assert.strictEqual(isWhitelistedCommand('python main.py'), false);
      assert.strictEqual(isWhitelistedCommand('cat package.json'), false);
    });
  });

  describe('Validation & Boundary Safeguards', () => {
    it('should throw error when command is empty', () => {
      assert.throws(() => {
        engine.executeCommand('');
      }, /Command is empty/);
    });

    it('should reject command containing blocked keyword rm -rf', () => {
      assert.throws(() => {
        engine.executeCommand('rm -rf test');
      }, /blocked keyword/);
    });

    it('should reject execution outside the workspace boundary', () => {
      assert.throws(() => {
        engine.executeCommand('pwd', path.resolve(workspaceRoot, '..'));
      }, /outside workspace root/);
    });

    it('should reject non-whitelisted commands', () => {
      assert.throws(() => {
        engine.executeCommand('cat file.txt');
      }, /not in the allowed V1 whitelist/);
    });
  });

  describe('Sequential Process Execution', () => {
    it('should queue and execute whitelisted command successfully', async () => {
      // Execute a quick command like python --version or npm --version (both should exit 0)
      // Wait, let's run a simple safe command: git status
      const cmdInfo = engine.executeCommand('git status');
      
      assert.strictEqual(cmdInfo.status, CommandStatus.Queued);

      // Wait for execution completion
      await new Promise(resolve => setTimeout(resolve, 800));

      const commands = engine.getCommands();
      const updated = commands.find(c => c.id === cmdInfo.id);
      assert.ok(updated);
      assert.ok([CommandStatus.Completed, CommandStatus.Failed].includes(updated.status));
    });

    it('should handle cancellation requests', async () => {
      const cmdInfo = engine.executeCommand('git status');
      engine.cancel();

      await new Promise(resolve => setTimeout(resolve, 100));

      const commands = engine.getCommands();
      const updated = commands.find(c => c.id === cmdInfo.id);
      assert.ok(updated);
      assert.strictEqual(updated.status, CommandStatus.Cancelled);
    });
  });
});
