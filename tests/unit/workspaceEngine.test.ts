import * as assert from 'assert';
import { workspaceEngine, InMemoryFsAdapter } from '../../src/core/workspace-engine';
import { IGenerationContract } from '../../src/core/generation-contract/types';

describe('Sprint 3 - Workspace Engine Module Tests', () => {

  const sampleContract: IGenerationContract = {
    contractVersion: '1.0.0',
    requestId: 'req-1',
    executionId: 'exec-1',
    fileOperations: [
      {
        operationId: 'op1',
        operationType: 'CREATE_FILE',
        filePath: 'c:/project/src/index.ts',
        relativePath: 'src/index.ts',
        language: 'TypeScript',
        encoding: 'utf-8',
        content: 'console.log("Hello World");',
        reason: 'Initialize app entry point',
        dependencies: []
      },
      {
        operationId: 'op2',
        operationType: 'MODIFY_FILE',
        filePath: 'c:/project/src/utils.ts',
        relativePath: 'src/utils.ts',
        language: 'TypeScript',
        encoding: 'utf-8',
        content: 'export const add = (a: number) => a + 1;',
        reason: 'Modify utils file',
        dependencies: []
      }
    ],
    directoryOperations: [
      {
        directoryPath: 'c:/project/src',
        operationType: 'CREATE_DIRECTORY',
        reason: 'Create folder structure'
      }
    ],
    warnings: [],
    errors: [],
    metadata: {
      generator: 'WorkspaceGenerator',
      timestamp: Date.now(),
      model: 'qwen-coder',
      projectId: 'proj-1'
    }
  };

  it('should apply file and directory operations successfully', async () => {
    const fs = new InMemoryFsAdapter();
    // Initialize utils.ts exists
    fs.setFile('c:/project/src/utils.ts', 'export const add = (a: number) => a;');

    const report = await workspaceEngine.applyChanges(sampleContract, fs);

    assert.strictEqual(report.rollbackStatus, 'NONE');
    assert.strictEqual(report.completedOperations.length, 3); // 1 directory + 2 files
    
    // Verify file contents changed
    assert.strictEqual(await fs.readFile('c:/project/src/index.ts'), 'console.log("Hello World");');
    assert.strictEqual(await fs.readFile('c:/project/src/utils.ts'), 'export const add = (a: number) => a + 1;');

    // Verify immutability
    assert.throws(() => {
      (report as any).rollbackStatus = 'SUCCESSFUL';
    }, /Cannot assign to read only property/);
  });

  it('should trigger rollback and restore previous state if an operation fails mid-execution', async () => {
    const fs = new InMemoryFsAdapter();
    fs.setFile('c:/project/src/utils.ts', 'original utils content');

    // Create a contract where op2 fails (by using a mock provider that throws on op2 or mimicking failed operation)
    // For this test, we can pass a file path that causes our filesystem adapter to throw.
    // Let's make fs throw on a specific path.
    const failingFs = new class extends InMemoryFsAdapter {
      public async writeFile(path: string, content: string): Promise<void> {
        if (path === 'c:/project/src/utils.ts') {
          throw new Error('Disk Full or File Locked');
        }
        await super.writeFile(path, content);
      }
    };

    const report = await workspaceEngine.applyChanges(sampleContract, failingFs);

    // Verify that the rollback was successful
    assert.strictEqual(report.rollbackStatus, 'SUCCESSFUL');
    assert.ok(report.errors.some(e => e.includes('File operation \'op2\' failed')));

    // Verify workspace state restored: index.ts (which didn't exist originally but was created in op1) should be deleted
    assert.strictEqual(await failingFs.exists('c:/project/src/index.ts'), false);
    // utils.ts should be restored to original contents
    assert.strictEqual(await failingFs.readFile('c:/project/src/utils.ts'), 'original utils content');
  });

});
