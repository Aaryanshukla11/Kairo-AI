import { EditOperation } from './editTypes';

export class EditValidator {
  public validate(
    ops: EditOperation[],
    fileSize: number
  ): void {
    if (ops.length === 0) {
      throw new Error('Incremental Edit validation error: No patch operations declared');
    }

    let totalEditBytes = 0;
    for (const op of ops) {
      if (op.range.start < 0 || op.range.end < op.range.start) {
        throw new Error(`Incremental Edit validation error: Invalid edit range offsets: [${op.range.start}, ${op.range.end}]`);
      }
      totalEditBytes += (op.range.end - op.range.start);
    }

    if (fileSize > 0 && (totalEditBytes / fileSize) > 0.9) {
      throw new Error('Incremental Edit validation error: Whole-file rewrites are prohibited. Proposing minimal precise changes instead.');
    }
  }
}

export const editValidator = new EditValidator();
