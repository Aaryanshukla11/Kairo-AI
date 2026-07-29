import { Patch } from './patchTypes';

export interface PatchPreviewData {
  linesAdded: number;
  linesRemoved: number;
  oldLinesCount: number;
  newLinesCount: number;
  diffLines: string[];
}

/**
 * Parses diff strings to extract lines added, lines removed, and lines list.
 */
export function generatePreview(patch: Patch): PatchPreviewData {
  const diff = patch.diff || '';
  const lines = diff.split(/\r?\n/);

  let linesAdded = 0;
  let linesRemoved = 0;
  
  for (const line of lines) {
    if (line.startsWith('+')) linesAdded++;
    else if (line.startsWith('-')) linesRemoved++;
  }

  const oldLinesCount = patch.oldContent ? patch.oldContent.split(/\r?\n/).length : 0;
  const newLinesCount = patch.newContent ? patch.newContent.split(/\r?\n/).length : 0;

  return {
    linesAdded,
    linesRemoved,
    oldLinesCount,
    newLinesCount,
    diffLines: lines
  };
}
