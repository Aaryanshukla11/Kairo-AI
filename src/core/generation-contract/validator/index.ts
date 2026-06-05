import { IGenerationContract } from '../types';

export class GenerationContractValidator {
  public validate(contract: IGenerationContract): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const seenFiles = new Map<string, string>();
    const seenDirs = new Set<string>();

    const isProtectedSegment = (part: string): boolean => {
      const lower = part.toLowerCase();
      if (['.git', '.gitignore', 'node_modules', '.vscode'].includes(lower)) {
        return true;
      }
      if (lower === '.env' || lower.startsWith('.env.')) {
        return true;
      }
      if (['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].includes(lower)) {
        return true;
      }
      return false;
    };

    for (const op of contract.fileOperations) {
      // 1. Verify content is present for create/modify
      if ((op.operationType === 'CREATE_FILE' || op.operationType === 'MODIFY_FILE') && op.content === undefined) {
        errors.push(`Missing content for file operation '${op.operationId}' on '${op.filePath}'`);
      }

      // 2. Verify protected files touch
      const normalizedRelative = (op.relativePath || op.filePath).replace(/\\/g, '/');
      const pathParts = normalizedRelative.split('/');
      const isProtected = pathParts.some(p => isProtectedSegment(p));
      if (isProtected) {
        errors.push(`Operation '${op.operationId}' attempts to modify protected file/directory '${op.relativePath || op.filePath}'. This action requires explicit approval.`);
      }

      // 3. Verify path escaping
      if (op.relativePath.includes('../') || op.filePath.includes('../')) {
        errors.push(`Invalid path escape: Operation '${op.operationId}' references a path outside the repository workspace.`);
      }

      // 4. Verify duplicate operation checks
      if (seenFiles.has(op.filePath)) {
        const prevOp = seenFiles.get(op.filePath)!;
        if (prevOp === op.operationType) {
          errors.push(`Duplicate file operation: Multiple '${op.operationType}' operations found for target '${op.filePath}'`);
        } else {
          errors.push(`Conflicting file operations: Found both '${prevOp}' and '${op.operationType}' for target '${op.filePath}'`);
        }
      }
      seenFiles.set(op.filePath, op.operationType);
    }

    for (const op of contract.directoryOperations) {
      // 1. Check directory path escaping
      if (op.directoryPath.includes('../')) {
        errors.push(`Invalid directory path escape referencing outside directory root.`);
      }

      // 2. Check duplicate directory operations
      if (seenDirs.has(op.directoryPath)) {
        warnings.push(`Directory already exists or duplicate operation for '${op.directoryPath}'`);
      }
      seenDirs.add(op.directoryPath);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const generationContractValidator = new GenerationContractValidator();
export default generationContractValidator;
