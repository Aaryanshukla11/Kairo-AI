import * as assert from 'assert';
import { generationContractBuilder } from '../../src/core/generation-contract';

describe('Sprint 3 - Generation Contract Module Tests', () => {

  const cleanContract = {
    contractVersion: '1.0.0',
    requestId: 'req-111',
    executionId: 'exec-222',
    fileOperations: [
      {
        operationId: 'op1',
        operationType: 'CREATE_FILE' as const,
        filePath: 'c:/project/src/index.ts',
        relativePath: 'src/index.ts',
        language: 'TypeScript',
        encoding: 'utf-8',
        content: 'console.log("Hello");',
        reason: 'Initialize app entry point',
        dependencies: []
      },
      {
        operationId: 'op2',
        operationType: 'MODIFY_FILE' as const,
        filePath: 'c:/project/src/utils.ts',
        relativePath: 'src/utils.ts',
        language: 'TypeScript',
        encoding: 'utf-8',
        content: 'export const run = () => {};',
        reason: 'Export helper utils',
        dependencies: ['op1']
      }
    ],
    directoryOperations: [
      {
        directoryPath: 'c:/project/src',
        operationType: 'CREATE_DIRECTORY' as const,
        reason: 'Create source folders'
      }
    ],
    warnings: [],
    errors: [],
    metadata: {
      generator: 'WorkspaceGenerator',
      timestamp: Date.now(),
      model: 'qwen-coder',
      projectId: 'proj-555'
    }
  };

  it('should compile valid contract successfully with no validation errors', () => {
    const result = generationContractBuilder.createContract(cleanContract);
    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.fileOperations[0].operationId, 'op1');

    // Verify immutability
    assert.throws(() => {
      (result as any).contractVersion = '2.0.0';
    }, /Cannot assign to read only property/);
  });

  it('should reject duplicate operations on the same target file path', () => {
    const faultyContract = {
      ...cleanContract,
      fileOperations: [
        ...cleanContract.fileOperations,
        {
          operationId: 'op3',
          operationType: 'CREATE_FILE' as const,
          filePath: 'c:/project/src/index.ts', // Duplicate target path
          relativePath: 'src/index.ts',
          language: 'TypeScript',
          encoding: 'utf-8',
          content: 'console.log("Hello Duplicate");',
          reason: 'Duplicate overwrite attempt',
          dependencies: []
        }
      ]
    };

    const result = generationContractBuilder.createContract(faultyContract);
    assert.ok(result.errors.some(e => e.includes('Duplicate file operation')));
  });

  it('should reject conflicting operations on the same file path', () => {
    const faultyContract = {
      ...cleanContract,
      fileOperations: [
        ...cleanContract.fileOperations,
        {
          operationId: 'op4',
          operationType: 'DELETE_FILE' as const,
          filePath: 'c:/project/src/index.ts', // Conflict: op1 creates this, op4 deletes it
          relativePath: 'src/index.ts',
          language: 'TypeScript',
          encoding: 'utf-8',
          content: '',
          reason: 'Conflicting delete',
          dependencies: []
        }
      ]
    };

    const result = generationContractBuilder.createContract(faultyContract);
    assert.ok(result.errors.some(e => e.includes('Conflicting file operations')));
  });

  it('should reject operations touching protected files', () => {
    const protectedContract = {
      ...cleanContract,
      fileOperations: [
        {
          operationId: 'op5',
          operationType: 'MODIFY_FILE' as const,
          filePath: 'c:/project/package-lock.json', // Protected file
          relativePath: 'package-lock.json',
          language: 'JSON',
          encoding: 'utf-8',
          content: '{}',
          reason: 'Modify dependencies locks',
          dependencies: []
        }
      ]
    };

    const result = generationContractBuilder.createContract(protectedContract);
    assert.ok(result.errors.some(e => e.includes('attempts to modify protected file')));
  });

  it('should reject path escaping relative outside project directory root', () => {
    const escapeContract = {
      ...cleanContract,
      fileOperations: [
        {
          operationId: 'op6',
          operationType: 'CREATE_FILE' as const,
          filePath: 'c:/project/../secrets/keys.json', // Path escape breakout
          relativePath: '../secrets/keys.json',
          language: 'JSON',
          encoding: 'utf-8',
          content: '{}',
          reason: 'Store credentials keys',
          dependencies: []
        }
      ]
    };

    const result = generationContractBuilder.createContract(escapeContract);
    assert.ok(result.errors.some(e => e.includes('Invalid path escape')));
  });

});
