import { EditOperation } from './editTypes';

export class ConflictDetector {
  public detectConflicts(ops: EditOperation[]): string[] {
    const conflicts: string[] = [];
    const sorted = [...ops].sort((a, b) => a.range.start - b.range.start);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (next.range.start < current.range.end) {
        conflicts.push(`Conflict detected: Overlapping edit regions detected between ranges [${current.range.start}, ${current.range.end}] and [${next.range.start}, ${next.range.end}]`);
      }
    }

    return conflicts;
  }
}

export const conflictDetector = new ConflictDetector();
