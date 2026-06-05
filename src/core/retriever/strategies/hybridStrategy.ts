import { RetrievalRequest, RetrievedContext } from '../retrieverTypes';
import { ProjectIndex } from '../../indexer/indexTypes';
import { SemanticStrategy } from './semanticStrategy';
import { KeywordStrategy } from './keywordStrategy';
import { StructuralStrategy } from './structuralStrategy';

export class HybridStrategy {
  private semantic = new SemanticStrategy();
  private keyword = new KeywordStrategy();
  private structural = new StructuralStrategy();

  /**
   * Combines semantic scores, text overlaps, and module imports to construct a merged, ranked RetrievedContext package.
   */
  public retrieve(request: RetrievalRequest, index: ProjectIndex): RetrievedContext {
    const rSemantic = this.semantic.retrieve(request, index);
    const rKeyword = this.keyword.retrieve(request, index);
    const rStructural = this.structural.retrieve(request, index);

    const filesMap = new Map<string, any>();
    [...rSemantic.files, ...rKeyword.files, ...rStructural.files].forEach(f => {
      filesMap.set(f.filePath, f);
    });

    const symbolsMap = new Map<string, any>();
    [...rSemantic.symbols, ...rKeyword.symbols, ...rStructural.symbols].forEach(s => {
      symbolsMap.set(`${s.name}:${s.filePath}`, s);
    });

    const confidenceScore = Math.max(
      rSemantic.confidenceScore,
      rKeyword.confidenceScore,
      rStructural.confidenceScore
    );

    return {
      files: Array.from(filesMap.values()).slice(0, 8),
      symbols: Array.from(symbolsMap.values()).slice(0, 12),
      dependencies: rStructural.dependencies,
      configs: [],
      documentation: [],
      confidenceScore
    };
  }
}
