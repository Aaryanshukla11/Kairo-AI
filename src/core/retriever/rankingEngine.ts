import { RetrievedContext } from './retrieverTypes';

export class RankingEngine {
  /**
   * Re-orders records based on proximity matches to current file edits.
   */
  public rerank(context: RetrievedContext, currentFile?: string): RetrievedContext {
    if (currentFile && currentFile.trim() !== '') {
      context.files.sort((a, b) => {
        if (a.filePath === currentFile) return -1;
        if (b.filePath === currentFile) return 1;
        return 0;
      });
    }
    return context;
  }
}

export const rankingEngine = new RankingEngine();
