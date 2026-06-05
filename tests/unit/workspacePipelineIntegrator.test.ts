import * as assert from 'assert';
import { workspacePipelineFacade } from '../../src/core/workspace-pipeline-integrator';
import { InMemoryFsAdapter } from '../../src/core/workspace-engine';
import { IGenerationContract } from '../../src/core/generation-contract/types';

describe('Sprint 4 - Workspace Pipeline Integrator Tests', () => {

  const contract1: IGenerationContract = {
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
        content: 'console.log("Welcome");',
        reason: 'Initialize app',
        dependencies: []
      }
    ],
    directoryOperations: [],
    warnings: [],
    errors: [],
    metadata: { generator: 'G1', timestamp: Date.now(), model: 'qwen', projectId: 'p1' }
  };

  const contract2: IGenerationContract = {
    contractVersion: '1.0.0',
    requestId: 'req-1',
    executionId: 'exec-1',
    fileOperations: [
      {
        operationId: 'op2',
        operationType: 'CREATE_FILE',
        filePath: 'c:/project/src/utils.ts',
        relativePath: 'src/utils.ts',
        language: 'TypeScript',
        encoding: 'utf-8',
        content: 'export const add = () => {};',
        reason: 'Add helper utils',
        dependencies: []
      }
    ],
    directoryOperations: [],
    warnings: [],
    errors: [],
    metadata: { generator: 'G2', timestamp: Date.now(), model: 'qwen', projectId: 'p1' }
  };

  it('should integrate and apply multiple generation contracts successfully', async () => {
    const fs = new InMemoryFsAdapter();
    const result = await workspacePipelineFacade.applyContracts([contract1, contract2], fs);

    assert.strictEqual(result.rollbackStatus, 'NONE');
    assert.strictEqual(result.createdFiles.length, 2);
    assert.strictEqual(await fs.readFile('c:/project/src/index.ts'), 'console.log("Welcome");');
    assert.strictEqual(await fs.readFile('c:/project/src/utils.ts'), 'export const add = () => {};');

    // Verify immutability
    assert.throws(() => {
      (result as any).rollbackStatus = 'SUCCESSFUL';
    }, /Cannot assign to read only property/);
  });

  it('should trigger rollback of all contracts if a contract application fails', async () => {
    const failingFs = new class extends InMemoryFsAdapter {
      public async writeFile(path: string, content: string): Promise<void> {
        if (path === 'c:/project/src/utils.ts') { // Fails on second contract write
          throw new Error('Write failed due to lock');
        }
        await super.writeFile(path, content);
      }
    };

    const result = await workspacePipelineFacade.applyContracts([contract1, contract2], failingFs);

    // Rollback status should reflect internal engine rollback
    assert.strictEqual(result.rollbackStatus, 'SUCCESSFUL');
    // First contract created file index.ts should have been rolled back and deleted
    assert.strictEqual(await failingFs.exists('c:/project/src/index.ts'), false);
    assert.strictEqual(await failingFs.exists('c:/project/src/utils.ts'), false);
  });

});
