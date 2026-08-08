import { RetrievalRequest, RetrievedContext, RetrieverEventType, SearchHit, RetrievalStrategyType } from './retrieverTypes';
import { retrievalPipeline } from './retrievalPipeline';
import { ProjectIndex } from '../indexer/indexTypes';
import { IndexRegistry } from '../indexer/indexRegistry';
import { indexBuilder } from '../indexer/indexBuilder';
import { RetrieverEvents } from './retrieverEvents';
import { retrievalCache } from './retrievalCache';
import { snippetProvider } from './snippetProvider';

export class RetrieverEngine {
  private events = new RetrieverEvents();

  /**
   * Subscribes a listener to Retriever changes.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  // --- API ---

  public retrieveContext(request: RetrievalRequest, index: ProjectIndex): RetrievedContext {
    this.events.emit(RetrieverEventType.RetrievalRequested, request.prompt);

    try {
      const context = retrievalPipeline.execute(request, index, this.events);
      return context;
    } catch (err: any) {
      this.events.emit(RetrieverEventType.RetrievalFailed, request.prompt, { error: err.message });
      throw err;
    }
  }

  public search(query: string, limit: number = 5, workspacePath: string): SearchHit[] {
    let index = IndexRegistry.getIndex(workspacePath);
    if (!index) {
      try {
        index = indexBuilder.buildIndex(workspacePath, 'default-workspace');
        IndexRegistry.setIndex(workspacePath, index);
      } catch (err) {
        index = {
          id: 'fallback-idx',
          workspaceId: 'fallback-ws',
          files: [],
          folders: [],
          symbols: [],
          dependencies: [],
          framework: 'None',
          language: 'None',
          updatedAt: Date.now()
        };
      }
    }

    const context = this.retrieveContext({
      prompt: query,
      strategy: RetrievalStrategyType.Hybrid
    }, index);

    const hits: SearchHit[] = [];

    // Map symbols to SearchHits
    for (const sym of context.symbols) {
      const snippet = snippetProvider.extractSymbolSnippet(workspacePath, sym.filePath, sym.line);
      hits.push({
        symbol: sym.name,
        file: sym.filePath,
        snippet: snippet || `// Symbol: ${sym.name} in ${sym.filePath}`,
        score: 0.9
      });
    }

    // Map files to SearchHits
    const filesWithSymbols = new Set(context.symbols.map(s => s.filePath));
    for (const file of context.files) {
      if (filesWithSymbols.has(file.filePath)) continue;
      const snippet = snippetProvider.extractFileSnippet(workspacePath, file.filePath);
      hits.push({
        file: file.filePath,
        snippet: snippet || `// File: ${file.filePath}`,
        score: 0.8
      });
    }

    return hits.slice(0, limit);
  }

  public invalidateCache(): void {
    retrievalCache.invalidate();
  }
}

