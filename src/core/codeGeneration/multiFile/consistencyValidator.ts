import { FileOperation } from './generationTypes';

export class ConsistencyValidator {
  public validateOperations(ops: FileOperation[]): void {
    const targets = new Set<string>();
    const deletedTargets = new Set<string>();

    for (const op of ops) {
      if (!op.filePath || op.filePath.trim() === '') {
        throw new Error('Multi-file consistency validation error: Invalid file path target (is empty)');
      }

      if (targets.has(op.filePath)) {
        throw new Error(`Multi-file consistency validation error: Duplicate file target detected for "${op.filePath}"`);
      }
      targets.add(op.filePath);

      if (op.operation === 'delete') {
        deletedTargets.add(op.filePath);
      }
    }

    for (const op of ops) {
      if (op.operation === 'rename' || op.operation === 'move') {
        if (op.originalPath && deletedTargets.has(op.originalPath)) {
          throw new Error(`Multi-file consistency validation error: Conflicting operations detected - original path "${op.originalPath}" is flagged for deletion`);
        }
      }
    }
  }

  public validateGraph(ops: FileOperation[], order: string[]): void {
    const opsTargets = new Set(ops.map(o => o.filePath));
    for (const op of ops) {
      for (const dep of op.dependencies) {
        if (!opsTargets.has(dep)) {
          throw new Error(`Multi-file consistency validation error: Broken dependency graph - path "${op.filePath}" depends on undefined path "${dep}"`);
        }
      }
    }
  }
}

export const consistencyValidator = new ConsistencyValidator();
