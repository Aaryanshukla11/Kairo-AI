import { ProjectIndex, IndexEventType, IndexEventListener } from './indexTypes';
import { indexBuilder } from './indexBuilder';
import { symbolIndexer } from './symbolIndexer';
import { dependencyIndexer } from './dependencyIndexer';
import { detectLanguage } from './languageDetector';
import { IndexRegistry } from './indexRegistry';
import * as path from 'path';
import * as fs from 'fs';

export class IndexerEngine {
  private listeners = new Set<IndexEventListener>();
  private currentIndex: ProjectIndex | null = null;

  constructor(private workspaceRoot: string) {}

  /**
   * Subscribes a listener to Project Indexer engine events.
   */
  public subscribe(listener: IndexEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: IndexEventType, payload?: any): void {
    const event = {
      type,
      payload,
      timestamp: Date.now()
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in indexer event listener:', err);
      }
    }
  }

  // --- API ---

  public startIndexing(workspaceId: string): ProjectIndex {
    this.emit(IndexEventType.IndexStarted, { workspaceId });

    const index = indexBuilder.buildIndex(
      this.workspaceRoot, 
      workspaceId,
      (percent) => {
        this.emit(IndexEventType.FileIndexed, { percent });
      }
    );

    this.currentIndex = index;
    IndexRegistry.setIndex(this.workspaceRoot, index);
    this.emit(IndexEventType.IndexCompleted, { index });
    return index;
  }

  public updateIndexFile(filePath: string): void {
    if (!this.currentIndex) return;

    const absolute = path.resolve(this.workspaceRoot, filePath);
    const relative = path.relative(this.workspaceRoot, absolute);

    this.currentIndex.symbols = this.currentIndex.symbols.filter(s => s.filePath !== relative);
    this.currentIndex.dependencies = this.currentIndex.dependencies.filter(d => d.sourceFilePath !== relative);

    if (fs.existsSync(absolute)) {
      try {
        const content = fs.readFileSync(absolute, 'utf8');

        const newSymbols = symbolIndexer.indexSymbols(relative, content);
        this.currentIndex.symbols.push(...newSymbols);

        const newDeps = dependencyIndexer.indexDependencies(relative, content);
        this.currentIndex.dependencies.push(...newDeps);

        const existingFile = this.currentIndex.files.find(f => f.filePath === relative);
        if (existingFile) {
          existingFile.size = fs.statSync(absolute).size;
        } else {
          this.currentIndex.files.push({
            filePath: relative,
            language: detectLanguage(absolute),
            size: fs.statSync(absolute).size
          });
        }
      } catch {
        // Skip
      }
    } else {
      this.currentIndex.files = this.currentIndex.files.filter(f => f.filePath !== relative);
    }

    this.currentIndex.updatedAt = Date.now();
    IndexRegistry.setIndex(this.workspaceRoot, this.currentIndex);
    this.emit(IndexEventType.IndexUpdated, { index: this.currentIndex });
  }

  public getIndex(): ProjectIndex | null {
    return this.currentIndex;
  }
}
