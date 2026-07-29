import { MemoryStore } from './memoryStore';
import { MemoryIndex } from './memoryIndex';
import { MemoryRetriever } from './memoryRetriever';
import { MemoryCompressor } from './memoryCompressor';
import { MemoryEvents } from './memoryEvents';
import { Memory, MemoryFilter, MemoryEventType } from './memoryTypes';
import { memoryMetrics } from './memoryMetrics';

export class MemoryBrain {
  private store = new MemoryStore();
  private index = new MemoryIndex();
  private retriever = new MemoryRetriever();
  private compressor = new MemoryCompressor();

  constructor(private events: MemoryEvents) {
    this.syncIndex();
  }

  public syncIndex(): void {
    this.index.rebuildIndex(this.store.getAll());
    memoryMetrics.recordOperation('sync', { count: this.store.getAll().length });
  }

  public createMemory(memory: Omit<Memory, 'createdAt' | 'updatedAt'>): Memory {
    const completeMemory: Memory = {
      ...memory,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.store.create(completeMemory);
    this.index.index(completeMemory);
    
    memoryMetrics.recordOperation('create', { type: completeMemory.type });
    this.events.emit(MemoryEventType.MemoryCreated, { memory: completeMemory });
    
    return completeMemory;
  }

  public getMemory(id: string): Memory | undefined {
    return this.store.get(id);
  }

  public updateMemory(id: string, updates: Partial<Memory>): Memory {
    const old = this.store.get(id);
    if (old) {
      this.index.deindex(id, old.type, old.tags || [], old.relatedFiles || []);
    }
    const updated = this.store.update(id, updates);
    this.index.index(updated);
    
    memoryMetrics.recordOperation('update', { id });
    this.events.emit(MemoryEventType.MemoryUpdated, { memory: updated });
    
    return updated;
  }

  public deleteMemory(id: string): void {
    const old = this.store.get(id);
    if (old) {
      this.index.deindex(id, old.type, old.tags || [], old.relatedFiles || []);
      this.store.delete(id);
      
      memoryMetrics.recordOperation('delete', { id });
      this.events.emit(MemoryEventType.MemoryDeleted, { id });
    }
  }

  public search(filter: MemoryFilter): Memory[] {
    const start = Date.now();
    const list = this.store.getAll();
    const results = this.retriever.retrieve(list, this.index, filter);
    
    const latencyMs = Date.now() - start;
    memoryMetrics.recordOperation('search', { latencyMs });
    
    this.events.emit(MemoryEventType.MemoryRetrieved, { count: results.length, filter });
    return results;
  }

  public compress(): void {
    const list = this.store.getAll();
    const { compressed, deletedIds } = this.compressor.compress(list);
    
    if (compressed.length > 0) {
      for (const id of deletedIds) {
        const old = this.store.get(id);
        if (old) {
          this.index.deindex(id, old.type, old.tags || [], old.relatedFiles || []);
          this.store.delete(id);
        }
      }
      for (const mem of compressed) {
        this.store.create(mem);
        this.index.index(mem);
      }
      memoryMetrics.recordOperation('compress');
      this.events.emit(MemoryEventType.MemoryCompressed, { compressedCount: compressed.length, deletedCount: deletedIds.length });
    }
  }

  public getAll(): Memory[] {
    return this.store.getAll();
  }
}
