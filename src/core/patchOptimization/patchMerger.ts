import { PatchOp } from './patchAnalyzer';

export class PatchMerger {
  public merge(ops: PatchOp[]): { merged: PatchOp[]; mergedLogs: string[] } {
    const merged: PatchOp[] = [];
    const mergedLogs: string[] = [];
    
    if (ops.length > 0) {
      let current = { ...ops[0] };
      for (let i = 1; i < ops.length; i++) {
        const next = ops[i];
        if (current.type === next.type && current.type === 'insert') {
          current.content += '\n' + next.content;
          mergedLogs.push(`Merged insert operations for content: "${next.content}"`);
        } else {
          merged.push(current);
          current = { ...next };
        }
      }
      merged.push(current);
    }

    return { merged, mergedLogs };
  }
}

export const patchMerger = new PatchMerger();
