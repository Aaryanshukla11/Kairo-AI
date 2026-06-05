import { VectorStoreProvider, MemoryProvider } from './providers';
import { VectorRecord, SimilarityResult, SimilarityMetric, VectorStoreEventType } from './vectorStoreTypes';
import { VectorStoreEvents } from './vectorStoreEvents';
import { vectorStoreValidator } from './vectorStoreValidator';
import { vectorStoreCache } from './vectorStoreCache';
import { VectorStorePersistence } from './vectorStorePersistence';
import { vectorStoreRegistry, VectorStoreStats } from './vectorStoreRegistry';
import { metadataFilter } from './metadataFilter';

export class VectorStoreEngine {
  private events = new VectorStoreEvents();
  private provider: VectorStoreProvider = new MemoryProvider();
  private persistence: VectorStorePersistence;

  constructor(private workspaceRoot: string) {
    this.persistence = new VectorStorePersistence(workspaceRoot);
    this.loadIndex();
  }

  /**
   * Subscribes a listener to Vector Store engine events.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public setProvider(provider: VectorStoreProvider): void {
    this.provider = provider;
    this.loadIndex();
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  private loadIndex(): void {
    const records = this.persistence.load();
    this.provider.clear();
    vectorStoreCache.clear();

    for (const record of records) {
      try {
        this.provider.insert(record);
        vectorStoreCache.set(record.id, record);
      } catch {
        // Skip
      }
    }

    this.events.emit(VectorStoreEventType.VectorLoaded, undefined, { count: records.length });
    this.events.emit(VectorStoreEventType.VectorStoreReady);
  }

  private saveIndex(): void {
    const records = this.provider.list();
    this.persistence.save(records);
  }

  // --- APIs ---

  public insert(record: VectorRecord): void {
    const existing = this.provider.list();
    const expected = existing.length > 0 ? existing[0].dimensions : undefined;

    vectorStoreValidator.validate(record, expected);

    if (this.provider.get(record.id)) {
      throw new Error(`Vector store error: Duplicate ID detected: "${record.id}"`);
    }

    this.provider.insert(record);
    vectorStoreCache.set(record.id, record);
    this.saveIndex();

    this.events.emit(VectorStoreEventType.VectorInserted, record.id, { record });
  }

  public update(record: VectorRecord): void {
    const existing = this.provider.list();
    const expected = existing.length > 0 ? existing[0].dimensions : undefined;

    vectorStoreValidator.validate(record, expected);

    this.provider.update(record);
    vectorStoreCache.set(record.id, record);
    this.saveIndex();

    this.events.emit(VectorStoreEventType.VectorUpdated, record.id, { record });
  }

  public delete(id: string): void {
    this.provider.delete(id);
    vectorStoreCache.delete(id);
    this.saveIndex();

    this.events.emit(VectorStoreEventType.VectorDeleted, id);
  }

  public get(id: string): VectorRecord | null {
    const cached = vectorStoreCache.get(id);
    if (cached) return cached;

    const record = this.provider.get(id);
    if (record) {
      vectorStoreCache.set(id, record);
      return record;
    }
    return null;
  }

  public query(filters: Record<string, any>): VectorRecord[] {
    const all = this.provider.list();
    return metadataFilter.filter(all, filters);
  }

  public similaritySearch(queryVector: number[], limit: number, metric: SimilarityMetric): SimilarityResult[] {
    return this.provider.similaritySearch(queryVector, limit, metric);
  }

  public clear(): void {
    this.provider.clear();
    vectorStoreCache.clear();
    this.saveIndex();
  }

  public getStats(): VectorStoreStats {
    const all = this.provider.list();
    const dim = all.length > 0 ? all[0].dimensions : 0;
    return vectorStoreRegistry.getStats(
      this.workspaceRoot,
      all.length,
      dim,
      this.provider.name,
      vectorStoreCache.getCacheHitRate()
    );
  }
}
