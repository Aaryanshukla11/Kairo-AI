import { IGenerationContract } from '../generation-contract/types';
import { IValidationReport, IValidationIssue } from './types';

export class ResponseValidator {
  public validate(contract: IGenerationContract): IValidationReport {
    const issues: IValidationIssue[] = [];

    // 1. Schema Validation
    if (!contract.contractVersion || typeof contract.contractVersion !== 'string') {
      issues.push({
        code: 'SCHEMA_VERSION_INVALID',
        severity: 'ERROR',
        message: 'Contract version is missing or invalid.'
      });
    }

    if (!contract.requestId || !contract.executionId) {
      issues.push({
        code: 'SCHEMA_METADATA_INVALID',
        severity: 'ERROR',
        message: 'Request ID or Execution ID is missing.'
      });
    }

    const opIds = new Set<string>();
    const filePaths = new Map<string, string>();
    const protectedFiles = new Set([
      '.git',
      '.gitignore',
      '.env',
      'node_modules',
      'package-lock.json'
    ]);

    // 2. Validate File Operations
    for (const op of contract.fileOperations) {
      opIds.add(op.operationId);

      // Check for empty/missing content on write
      if ((op.operationType === 'CREATE_FILE' || op.operationType === 'MODIFY_FILE') && !op.content) {
        issues.push({
          code: 'CONTENT_EMPTY',
          severity: 'ERROR',
          message: `Content is empty or missing for write operation '${op.operationId}'`,
          path: op.filePath
        });
      }

      // Check path traversal & breakouts
      if (op.relativePath.includes('../') || op.filePath.includes('../')) {
        issues.push({
          code: 'PATH_TRAVERSAL',
          severity: 'ERROR',
          message: `Path traversal detected in path '${op.relativePath}'`,
          path: op.filePath
        });
      }

      // Check protected files rules
      const parts = op.relativePath.split('/');
      const touchesProtected = parts.some(p => protectedFiles.has(p));
      if (touchesProtected) {
        issues.push({
          code: 'PROTECTED_FILE_VIOLATION',
          severity: 'ERROR',
          message: `Operation touches protected file or directory '${op.relativePath}'`,
          path: op.filePath
        });
      }

      // Check unsafe deletions
      if (op.operationType === 'DELETE_FILE' && op.relativePath === 'package.json') {
        issues.push({
          code: 'UNSAFE_DELETE',
          severity: 'ERROR',
          message: 'Deleting project package.json is unsafe and blocked.',
          path: op.filePath
        });
      }

      // Check duplicate/conflicting operations
      if (filePaths.has(op.filePath)) {
        const prev = filePaths.get(op.filePath)!;
        issues.push({
          code: 'CONFLICTING_OPERATIONS',
          severity: 'ERROR',
          message: `Conflicting operations found on path. Previous: '${prev}', Current: '${op.operationType}'`,
          path: op.filePath
        });
      }
      filePaths.set(op.filePath, op.operationType);
    }

    // 3. Dependency Validation
    for (const op of contract.fileOperations) {
      for (const depId of op.dependencies) {
        if (!opIds.has(depId)) {
          issues.push({
            code: 'MISSING_DEPENDENCY',
            severity: 'ERROR',
            message: `Operation dependency '${depId}' referenced by '${op.operationId}' does not exist in this contract.`
          });
        }
      }
    }

    const isValid = !issues.some(i => i.severity === 'ERROR');

    return {
      isValid,
      timestamp: Date.now(),
      issues: Object.freeze(issues)
    };
  }
}

export const responseValidator = new ResponseValidator();
export default responseValidator;
