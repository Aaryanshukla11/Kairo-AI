import { RetrievalRequest, RetrievedContext } from '../retrieverTypes';
import { ProjectIndex } from '../../indexer/indexTypes';
import { vectorStoreService } from '../../vectorStore/vectorStoreService';
import { SimilarityMetric } from '../../vectorStore/vectorStoreTypes';

export class SemanticStrategy {
  /**
   * Generates mock query vector from prompt characters and runs similarity search rankings.
   */
  public retrieve(request: RetrievalRequest, index: ProjectIndex): RetrievedContext {
    const queryVector: number[] = [];
    const len = request.prompt.length;
    for (let i = 0; i < 384; i++) {
      const code = len > 0 ? request.prompt.charCodeAt(i % len) : 0;
      queryVector.push(Math.sin(code + i) * 0.5 + 0.5);
    }

    let similarityMatches: any[] = [];
    try {
      similarityMatches = vectorStoreService.similaritySearch(queryVector, 5, SimilarityMetric.Cosine);
    } catch {
      // Vector store may be uninitialized
    }
    
    const matchingFilePaths = new Set(similarityMatches.map(m => m.record.sourceId));

    const files = index.files.filter(f => matchingFilePaths.has(f.filePath));
    const symbols = index.symbols.filter(s => matchingFilePaths.has(s.filePath));

    return {
      files,
      symbols,
      dependencies: [],
      configs: [],
      documentation: [],
      confidenceScore: similarityMatches.length > 0 ? similarityMatches[0].score : 0.5
    };
  }
}
