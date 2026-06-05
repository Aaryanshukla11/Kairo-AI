import { randomUUID } from 'crypto';
import { EmbeddingObject, EmbeddingSourceType, EmbeddingStatus, EmbeddingEventType } from './embeddingTypes';
import { EmbeddingEvents } from './embeddingEvents';
import { embeddingValidator } from './embeddingValidator';
import { embeddingCache } from './embeddingCache';
import { EmbeddingQueue, EmbeddingJob } from './embeddingQueue';
import { EmbeddingProvider, MockProvider } from './providers';

export class EmbeddingEngine {
  private events = new EmbeddingEvents();
  private queue = new EmbeddingQueue();
  private provider: EmbeddingProvider = new MockProvider();
  private failedItems = new Map<string, string>();

  /**
   * Subscribes a listener to Embedding Engine changes.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public setProvider(provider: EmbeddingProvider): void {
    this.provider = provider;
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  public getPendingQueue(): EmbeddingJob[] {
    return this.queue.getPending();
  }

  public getFailedItems(): Map<string, string> {
    return this.failedItems;
  }

  // --- API ---

  public queueJob(sourceId: string, sourceType: EmbeddingSourceType, content: string): EmbeddingObject {
    embeddingValidator.validate(sourceId, sourceType, content);

    const checksum = embeddingCache.getChecksum(content);
    
    const cached = embeddingCache.get(sourceId, checksum);
    if (cached) {
      return cached;
    }

    const queuedObj: EmbeddingObject = {
      id: randomUUID(),
      sourceId,
      sourceType,
      vectorId: '',
      checksum,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider: this.provider.name,
      status: EmbeddingStatus.Queued
    };

    const enqueued = this.queue.enqueue({ sourceId, sourceType, content });
    if (enqueued) {
      this.events.emit(EmbeddingEventType.EmbeddingQueued, sourceId, { queuedObj });
    }

    return queuedObj;
  }

  /**
   * Processes all queued jobs sequentially using pluggable providers.
   */
  public async processQueue(): Promise<void> {
    let job: EmbeddingJob | null;

    while ((job = this.queue.dequeue()) !== null) {
      const { sourceId, sourceType, content } = job;
      
      if (this.queue.isActive(sourceId)) {
        continue;
      }

      this.queue.markActive(sourceId);
      this.events.emit(EmbeddingEventType.EmbeddingStarted, sourceId);

      try {
        const checksum = embeddingCache.getChecksum(content);
        const vector = await this.provider.generate(content);

        const obj: EmbeddingObject = {
          id: randomUUID(),
          sourceId,
          sourceType,
          vectorId: `vec-${randomUUID()}`,
          checksum,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          provider: this.provider.name,
          status: EmbeddingStatus.Completed,
          vector
        };

        embeddingCache.set(sourceId, obj);
        this.failedItems.delete(sourceId);
        this.events.emit(EmbeddingEventType.EmbeddingGenerated, sourceId, { obj });
      } catch (err: any) {
        this.failedItems.set(sourceId, err.message || 'Unknown generation failure');
        this.events.emit(EmbeddingEventType.EmbeddingFailed, sourceId, { error: err.message });
      } finally {
        this.queue.markInactive(sourceId);
      }
    }
  }
}
