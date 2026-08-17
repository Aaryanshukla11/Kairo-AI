import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { NodeFsAdapter } from '../../src/core/workspace-engine/fs-adapter';
import { GenerationContractValidator } from '../../src/core/generation-contract/validator';
import { IGenerationContract } from '../../src/core/generation-contract/types';
import { GeminiProvider } from '../../src/core/inference/providers/geminiProvider';
import { PatchApplier } from '../../src/core/patch/patchApplier';
import { ChangeType, PatchStatus } from '../../src/core/patch/patchTypes';

describe('Chunk 8 - Security Hardening Unit Tests', () => {
  const fsAdapter = new NodeFsAdapter();
  const validator = new GenerationContractValidator();

  describe('Part A - Workspace Root Boundary (NodeFsAdapter)', () => {
    it('should allow valid relative workspace path "index.html"', () => {
      const safePath = fsAdapter.resolveSafeWorkspacePath('index.html');
      assert.ok(safePath.endsWith('index.html'));
    });

    it('should allow valid relative workspace path "src/utils.ts"', () => {
      const safePath = fsAdapter.resolveSafeWorkspacePath('src/utils.ts');
      assert.ok(safePath.includes('src'));
    });

    it('should reject parent directory escape "../secret.txt"', () => {
      assert.throws(() => {
        fsAdapter.resolveSafeWorkspacePath('../secret.txt');
      }, /Security Violation/);
    });

    it('should reject double parent directory escape "../../secret.txt"', () => {
      assert.throws(() => {
        fsAdapter.resolveSafeWorkspacePath('../../secret.txt');
      }, /Security Violation/);
    });

    it('should reject absolute Unix path "/etc/passwd"', () => {
      assert.throws(() => {
        fsAdapter.resolveSafeWorkspacePath('/etc/passwd');
      }, /Security Violation/);
    });

    it('should reject Windows drive escape "C:\\Windows\\System32\\test.txt"', () => {
      assert.throws(() => {
        fsAdapter.resolveSafeWorkspacePath('C:\\Windows\\System32\\test.txt');
      }, /Security Violation/);
    });

    it('should reject workspace sibling directory escape "workspace2/file.txt"', () => {
      assert.throws(() => {
        fsAdapter.resolveSafeWorkspacePath('../workspace2/file.txt');
      }, /Security Violation/);
    });

    it('should reject UNC path "\\\\server\\share\\file.txt"', () => {
      assert.throws(() => {
        fsAdapter.resolveSafeWorkspacePath('\\\\server\\share\\file.txt');
      }, /Security Violation/);
    });
  });

  describe('Part B - Protected Files (GenerationContractValidator)', () => {
    const buildContract = (filePath: string, opType: 'CREATE_FILE' | 'MODIFY_FILE' | 'DELETE_FILE' = 'CREATE_FILE'): IGenerationContract => ({
      contractVersion: '1.0.0',
      requestId: 'req-sec-test',
      executionId: 'exec-sec-test',
      fileOperations: [
        {
          operationId: 'op-1',
          operationType: opType,
          filePath,
          relativePath: filePath,
          language: 'Text',
          encoding: 'utf-8',
          content: opType === 'DELETE_FILE' ? '' : '// test content',
          reason: 'Test operation',
          dependencies: []
        }
      ],
      directoryOperations: [],
      warnings: [],
      errors: [],
      metadata: {
        generator: 'TestGenerator',
        timestamp: Date.now(),
        model: 'TestModel',
        projectId: 'TestProject'
      }
    });

    it('should reject protected file ".env"', () => {
      const res = validator.validate(buildContract('.env'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should reject protected dot-env variant ".env.local"', () => {
      const res = validator.validate(buildContract('.env.local'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should reject protected dot-env variant ".env.production"', () => {
      const res = validator.validate(buildContract('.env.production'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should reject protected dot-env variant ".env.staging"', () => {
      const res = validator.validate(buildContract('.env.staging'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should reject protected directory ".git/config"', () => {
      const res = validator.validate(buildContract('.git/config'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should reject protected directory ".vscode/settings.json"', () => {
      const res = validator.validate(buildContract('.vscode/settings.json'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should reject protected directory "node_modules/package.json"', () => {
      const res = validator.validate(buildContract('node_modules/package.json'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should reject lockfile "package-lock.json"', () => {
      const res = validator.validate(buildContract('package-lock.json'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should reject lockfile "pnpm-lock.yaml"', () => {
      const res = validator.validate(buildContract('pnpm-lock.yaml'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should reject lockfile "yarn.lock"', () => {
      const res = validator.validate(buildContract('yarn.lock'));
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('protected file/directory')));
    });

    it('should ALLOW legitimate file "src/config/environment.ts"', () => {
      const res = validator.validate(buildContract('src/config/environment.ts'));
      assert.strictEqual(res.valid, true);
    });

    it('should ALLOW legitimate file "src/env-loader.ts"', () => {
      const res = validator.validate(buildContract('src/env-loader.ts'));
      assert.strictEqual(res.valid, true);
    });

    it('should ALLOW legitimate file "documentation/env.md"', () => {
      const res = validator.validate(buildContract('documentation/env.md'));
      assert.strictEqual(res.valid, true);
    });

    it('should reject uppercase protected variant ".ENV"', () => {
      const res = validator.validate(buildContract('.ENV'));
      assert.strictEqual(res.valid, false);
    });

    it('should reject mixed-case protected variant ".Env.local"', () => {
      const res = validator.validate(buildContract('.Env.local'));
      assert.strictEqual(res.valid, false);
    });

    it('should reject uppercase git directory ".GIT/config"', () => {
      const res = validator.validate(buildContract('.GIT/config'));
      assert.strictEqual(res.valid, false);
    });

    it('should reject uppercase vscode directory ".VSCODE/settings.json"', () => {
      const res = validator.validate(buildContract('.VSCODE/settings.json'));
      assert.strictEqual(res.valid, false);
    });

    it('should protect .env for CREATE_FILE, MODIFY_FILE, and DELETE_FILE operations', () => {
      assert.strictEqual(validator.validate(buildContract('.env', 'CREATE_FILE')).valid, false);
      assert.strictEqual(validator.validate(buildContract('.env', 'MODIFY_FILE')).valid, false);
      assert.strictEqual(validator.validate(buildContract('.env', 'DELETE_FILE')).valid, false);
    });
  });

  describe('Part C - Symlink / Reparse Point & API Key Security (Chunk 8.1)', () => {
    it('should detect and reject physical symlink pointing outside workspace root', () => {
      const testDir = path.resolve(process.cwd(), 'scratch_symlink_test_dir');
      const targetOutsideDir = os.tmpdir();
      const symlinkPath = path.resolve(testDir, 'outside_symlink');

      try {
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
        if (fs.existsSync(symlinkPath)) {
          fs.unlinkSync(symlinkPath);
        }

        try {
          fs.symlinkSync(targetOutsideDir, symlinkPath, 'dir');
        } catch {
          // On Windows without admin privileges, symlink creation may fail. Skip physical symlink test if OS blocks creation.
          return;
        }

        const relativeSymlinkFile = path.relative(process.cwd(), path.join(symlinkPath, 'stolen_file.txt'));
        assert.throws(() => {
          fsAdapter.resolveSafeWorkspacePath(relativeSymlinkFile);
        }, /Security Violation/);
      } finally {
        try {
          if (fs.existsSync(symlinkPath)) fs.unlinkSync(symlinkPath);
          if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        } catch {}
      }
    });

    it('should throw clean configuration error when Gemini API key is missing', async () => {
      const savedKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      try {
        const provider = new GeminiProvider('');
        await provider.execute({
          requestId: 'test-req',
          providerName: 'gemini',
          prompt: 'test prompt',
          modelName: 'gemini-2.5-flash',
          parameters: {},
          metadata: {}
        });
        assert.fail('Should have thrown configuration error');
      } catch (err: any) {
        assert.ok(err.message.includes('Missing GEMINI_API_KEY environment variable'));
        assert.ok(!err.message.includes('AQ.Ab8RN6')); // Must not leak any key
      } finally {
        if (savedKey !== undefined) {
          process.env.GEMINI_API_KEY = savedKey;
        }
      }
    });

    it('should reject PatchApplier attempt to operate on path escaping workspace', () => {
      const applier = new PatchApplier();
      assert.throws(() => {
        applier.apply({
          id: 'p-1',
          operationId: 'op-1',
          filePath: '../escaped_patch_file.txt',
          changeType: ChangeType.Create,
          status: PatchStatus.Draft,
          createdAt: Date.now(),
          newContent: 'test'
        }, process.cwd());
      }, /Security Violation/);
    });
  });
});
