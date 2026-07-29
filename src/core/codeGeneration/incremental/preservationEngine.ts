import { EditOperation } from './editTypes';

export class PreservationEngine {
  public identifyPreservedRegions(
    content: string,
    ops: EditOperation[]
  ): { start: number; end: number }[] {
    const preserved: { start: number; end: number }[] = [];
    let currentIdx = 0;

    const sortedOps = [...ops].sort((a, b) => a.range.start - b.range.start);

    for (const op of sortedOps) {
      if (op.range.start > currentIdx) {
        preserved.push({ start: currentIdx, end: op.range.start });
      }
      currentIdx = op.range.end;
    }

    if (currentIdx < content.length) {
      preserved.push({ start: currentIdx, end: content.length });
    }

    return preserved;
  }
}

export const preservationEngine = new PreservationEngine();
