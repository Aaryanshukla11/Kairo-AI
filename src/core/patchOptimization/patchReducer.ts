import { PatchOp } from './patchAnalyzer';

export class PatchReducer {
  public reduce(ops: PatchOp[]): { reduced: PatchOp[]; removed: string[] } {
    const reduced: PatchOp[] = [];
    const removed: string[] = [];

    for (const op of ops) {
      if (op.content.trim() === '' && op.type === 'replace') {
        removed.push(`Removed redundant empty replace operation at lines ${op.lineStart}-${op.lineEnd}`);
      } else {
        reduced.push(op);
      }
    }

    return { reduced, removed };
  }
}

export const patchReducer = new PatchReducer();
