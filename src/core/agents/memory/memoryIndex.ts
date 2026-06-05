import { Memory, MemoryType } from './memoryTypes';

export class MemoryIndex {
  private tagIndex = new Map<string, Set<string>>();
  private typeIndex = new Map<MemoryType, Set<string>>();
  private fileIndex = new Map<string, Set<string>>();

  public rebuildIndex(memories: Memory[]): void {
    this.tagIndex.clear();
    this.typeIndex.clear();
    this.fileIndex.clear();

    for (const mem of memories) {
      this.index(mem);
    }
  }

  public index(mem: Memory): void {
    if (!this.typeIndex.has(mem.type)) {
      this.typeIndex.set(mem.type, new Set());
    }
    this.typeIndex.get(mem.type)!.add(mem.id);

    if (mem.tags) {
      for (const tag of mem.tags) {
        const normalized = tag.toLowerCase().trim();
        if (!this.tagIndex.has(normalized)) {
          this.tagIndex.set(normalized, new Set());
        }
        this.tagIndex.get(normalized)!.add(mem.id);
      }
    }

    if (mem.relatedFiles) {
      for (const file of mem.relatedFiles) {
        const normalized = file.toLowerCase().trim();
        if (!this.fileIndex.has(normalized)) {
          this.fileIndex.set(normalized, new Set());
        }
        this.fileIndex.get(normalized)!.add(mem.id);
      }
    }
  }

  public deindex(memId: string, type: MemoryType, tags: string[], files: string[]): void {
    this.typeIndex.get(type)?.delete(memId);
    if (tags) {
      for (const tag of tags) {
        this.tagIndex.get(tag.toLowerCase().trim())?.delete(memId);
      }
    }
    if (files) {
      for (const file of files) {
        this.fileIndex.get(file.toLowerCase().trim())?.delete(memId);
      }
    }
  }

  public getIdsByType(type: MemoryType): Set<string> {
    return this.typeIndex.get(type) || new Set();
  }

  public getIdsByTag(tag: string): Set<string> {
    return this.tagIndex.get(tag.toLowerCase().trim()) || new Set();
  }

  public getIdsByFile(file: string): Set<string> {
    return this.fileIndex.get(file.toLowerCase().trim()) || new Set();
  }
}
