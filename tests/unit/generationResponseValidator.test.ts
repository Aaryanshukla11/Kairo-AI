import * as assert from 'assert';
import { generationResponseValidator } from '../../src/core/generation-response-validator';
import { IGenerationContract } from '../../src/core/generation-contract/types';

describe('Sprint 3 - Generation Response Validator Tests', () => {

  const cleanContract: IGenerationContract = {
    contractVersion: '1.0.0',
    requestId: 'req-333',
    executionId: 'exec-444',
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
      },
      {
        operationId: 'op2',
        operationType: 'MODIFY_FILE',
        filePath: 'c:/project/src/utils.ts',
        relativePath: 'src/utils.ts',
        language: 'TypeScript',
        encoding: 'utf-8',
        content: 'export const run = () => {};',
        reason: 'Add helper utility',
        dependencies: ['op1']
      }
    ],
    directoryOperations: [],
    warnings: [],
    errors: [],
    metadata: {
      generator: 'WorkspaceGenerator',
      timestamp: Date.now(),
      model: 'deepseek-coder',
      projectId: 'proj-777'
    }
  };

  it('should validate complete contracts successfully', () => {
    const result = generationResponseValidator.validateContract(cleanContract);
    assert.strictEqual(result.report.isValid, true);
    assert.strictEqual(result.report.issues.length, 0);
    assert.ok(result.validatedContract);

    // Verify immutability
    assert.throws(() => {
      (result as any).report = {};
    }, /Cannot assign to read only property/);
  });

  it('should detect path traversal breakout attempts', () => {
    const traversalContract: IGenerationContract = {
      ...cleanContract,
      fileOperations: [
        {
          operationId: 'op3',
          operationType: 'CREATE_FILE',
          filePath: 'c:/project/../secrets/db.env', // Path escape
          relativePath: '../secrets/db.env',
          language: 'ENV',
          encoding: 'utf-8',
          content: 'DB_PASS=123',
          reason: 'Save db variables',
          dependencies: []
        }
      ]
    };

    const result = generationResponseValidator.validateContract(traversalContract);
    assert.strictEqual(result.report.isValid, false);
    assert.ok(result.report.issues.some(i => i.code === 'PATH_TRAVERSAL'));
  });

  it('should detect unsafe package.json deletions', () => {
    const deleteContract: IGenerationContract = {
      ...cleanContract,
      fileOperations: [
        {
          operationId: 'op4',
          operationType: 'DELETE_FILE',
          filePath: 'c:/project/package.json', // Unsafe delete
          relativePath: 'package.json',
          language: 'JSON',
          encoding: 'utf-8',
          content: '',
          reason: 'Remove configs',
          dependencies: []
        }
      ]
    };

    const result = generationResponseValidator.validateContract(deleteContract);
    assert.strictEqual(result.report.isValid, false);
    assert.ok(result.report.issues.some(i => i.code === 'UNSAFE_DELETE'));
  });

  it('should detect missing dependencies between file operations', () => {
    const brokenDepContract: IGenerationContract = {
      ...cleanContract,
      fileOperations: [
        {
          operationId: 'op5',
          operationType: 'CREATE_FILE',
          filePath: 'c:/project/src/index.ts',
          relativePath: 'src/index.ts',
          language: 'TypeScript',
          encoding: 'utf-8',
          content: 'console.log("Welcome");',
          reason: 'Initialize app',
          dependencies: ['non-existent-op'] // Broken dep reference
        }
      ]
    };

    const result = generationResponseValidator.validateContract(brokenDepContract);
    assert.strictEqual(result.report.isValid, false);
    assert.ok(result.report.issues.some(i => i.code === 'MISSING_DEPENDENCY'));
  });

  it('should detect duplicate conflicting file writes', () => {
    const conflictContract: IGenerationContract = {
      ...cleanContract,
      fileOperations: [
        {
          operationId: 'op6',
          operationType: 'CREATE_FILE',
          filePath: 'c:/project/src/index.ts',
          relativePath: 'src/index.ts',
          language: 'TypeScript',
          encoding: 'utf-8',
          content: 'console.log("Welcome");',
          reason: 'Initialize app',
          dependencies: []
        },
        {
          operationId: 'op7',
          operationType: 'MODIFY_FILE',
          filePath: 'c:/project/src/index.ts', // Conflict write on same target path
          relativePath: 'src/index.ts',
          language: 'TypeScript',
          encoding: 'utf-8',
          content: 'console.log("Modified");',
          reason: 'Modify app entry',
          dependencies: []
        }
      ]
    };

    const result = generationResponseValidator.validateContract(conflictContract);
    assert.strictEqual(result.report.isValid, false);
    assert.ok(result.report.issues.some(i => i.code === 'CONFLICTING_OPERATIONS'));
  });

});
