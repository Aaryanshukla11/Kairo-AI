import { WorkspaceSymbol, IndexedFile } from '../indexer/indexTypes';

export class ContextScorer {
  /**
   * Evaluates proximity overlaps and term matches to build numeric files weight metrics.
   */
  public scoreFile(file: IndexedFile, prompt: string, currentFile?: string): number {
    let score = 0.1;

    const name = file.filePath.toLowerCase();
    const terms = prompt.toLowerCase().split(/\s+/);
    let overlap = 0;
    for (const term of terms) {
      if (term.length > 2 && name.includes(term)) {
        overlap += 0.35;
      }
    }
    score += Math.min(overlap, 0.6);

    if (currentFile && currentFile.trim() !== '') {
      if (file.filePath === currentFile) {
        score += 0.25;
      } else if (require('path').dirname(file.filePath) === require('path').dirname(currentFile)) {
        score += 0.15;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Ranks symbols based on target text occurrences.
   */
  public scoreSymbol(sym: WorkspaceSymbol, prompt: string): number {
    let score = 0.1;
    const name = sym.name.toLowerCase();
    const terms = prompt.toLowerCase().split(/\s+/);
    for (const term of terms) {
      if (term.length > 2 && name.includes(term)) {
        score += 0.4;
      }
    }
    return Math.min(score, 1.0);
  }
}

export const contextScorer = new ContextScorer();
