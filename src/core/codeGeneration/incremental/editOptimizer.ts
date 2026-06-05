import { EditOperation } from './editTypes';

export class EditOptimizer {
  public optimize(ops: EditOperation[]): EditOperation[] {
    if (ops.length <= 1) return ops;

    // Sort operations by starting range
    const sorted = [...ops].sort((a, b) => a.range.start - b.range.start);
    const optimized: EditOperation[] = [];

    let current = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      // Merge if overlapping or contiguous
      if (next.range.start <= current.range.end + 5) {
        current = {
          type: 'replace',
          range: { start: current.range.start, end: Math.max(current.range.end, next.range.end) },
          text: current.text + next.text
        };
      } else {
        optimized.push(current);
        current = next;
      }
    }
    optimized.push(current);
    return optimized;
  }
}

export const editOptimizer = new EditOptimizer();
