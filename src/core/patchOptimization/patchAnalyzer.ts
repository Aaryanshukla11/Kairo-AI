export interface PatchOp {
  lineStart: number;
  lineEnd: number;
  content: string;
  type: 'insert' | 'delete' | 'replace';
}

export class PatchAnalyzer {
  public parseOps(patchContent: string): PatchOp[] {
    const lines = patchContent.split('\n');
    const ops: PatchOp[] = [];

    for (const line of lines) {
      if (line.startsWith('+')) {
        ops.push({ lineStart: 1, lineEnd: 1, content: line.slice(1), type: 'insert' });
      } else if (line.startsWith('-')) {
        ops.push({ lineStart: 1, lineEnd: 1, content: line.slice(1), type: 'delete' });
      }
    }

    return ops;
  }
}

export const patchAnalyzer = new PatchAnalyzer();
