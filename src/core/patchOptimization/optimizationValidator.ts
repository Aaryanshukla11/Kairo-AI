import { PatchOp } from './patchAnalyzer';

export class OptimizationValidator {
  public validate(ops: PatchOp[]): void {
    // Check for overlapping edits (e.g. referencing same lineStart bounds)
    const lineRanges = new Set<number>();
    for (const op of ops) {
      if (op.lineStart !== 1 && lineRanges.has(op.lineStart)) {
        throw new Error(`Patch Optimization validation failure: Overlapping edit operations detected at line ${op.lineStart}`);
      }
      lineRanges.add(op.lineStart);
    }
  }
}

export const optimizationValidator = new OptimizationValidator();
