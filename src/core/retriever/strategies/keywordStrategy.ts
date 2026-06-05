import { RetrievalRequest, RetrievedContext } from '../retrieverTypes';
import { ProjectIndex } from '../../indexer/indexTypes';
import { contextScorer } from '../contextScorer';

export class KeywordStrategy {
  /**
   * Scores files and symbols based on text name matches.
   */
  public retrieve(request: RetrievalRequest, index: ProjectIndex): RetrievedContext {
    const scoredFiles = index.files.map(f => ({
      file: f,
      score: contextScorer.scoreFile(f, request.prompt, request.currentFile)
    })).filter(sf => sf.score > 0.15);

    scoredFiles.sort((a, b) => b.score - a.score);

    const scoredSymbols = index.symbols.map(s => ({
      symbol: s,
      score: contextScorer.scoreSymbol(s, request.prompt)
    })).filter(ss => ss.score > 0.2);

    scoredSymbols.sort((a, b) => b.score - a.score);

    return {
      files: scoredFiles.map(sf => sf.file).slice(0, 5),
      symbols: scoredSymbols.map(ss => ss.symbol).slice(0, 10),
      dependencies: [],
      configs: [],
      documentation: [],
      confidenceScore: scoredFiles.length > 0 ? Math.min(scoredFiles[0].score + 0.1, 1.0) : 0.4
    };
  }
}
