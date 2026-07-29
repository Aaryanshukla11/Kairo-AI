import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { Memory } from './memoryTypes';
import { memoryValidator } from './memoryValidator';

export class MemoryStore {
  private memories = new Map<string, Memory>();
  private storagePath: string | null = null;

  constructor() {
    this.initStoragePath();
  }

  private initStoragePath(): void {
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
      const root = folders[0].uri.fsPath;
      const aiidleDir = path.join(root, '.aiidle', 'memory');
      if (!fs.existsSync(aiidleDir)) {
        fs.mkdirSync(aiidleDir, { recursive: true });
      }
      this.storagePath = path.join(aiidleDir, 'project-memories.json');
      this.loadFromDisk();
    }
  }

  private loadFromDisk(): void {
    if (!this.storagePath || !fs.existsSync(this.storagePath)) return;
    try {
      const raw = fs.readFileSync(this.storagePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.memories.clear();
        for (const item of parsed) {
          if (item && item.id) {
            this.memories.set(item.id, item);
          }
        }
      }
    } catch (err) {
      console.error('[MemoryStore] Failed to load memories from disk:', err);
    }
  }

  private saveToDisk(): void {
    if (!this.storagePath) return;
    try {
      const arr = Array.from(this.memories.values());
      fs.writeFileSync(this.storagePath, JSON.stringify(arr, null, 2), 'utf8');
    } catch (err) {
      console.error('[MemoryStore] Failed to save memories to disk:', err);
    }
  }

  public create(memory: Memory): void {
    const idSet = new Set(this.memories.keys());
    memoryValidator.validate(memory, idSet);
    this.memories.set(memory.id, memory);
    this.saveToDisk();
  }

  public get(id: string): Memory | undefined {
    return this.memories.get(id);
  }

  public getAll(): Memory[] {
    return Array.from(this.memories.values());
  }

  public update(id: string, updates: Partial<Memory>): Memory {
    const existing = this.memories.get(id);
    if (!existing) {
      throw new Error(`Memory update error: Memory with ID "${id}" not found`);
    }

    const updated: Memory = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now()
    };

    const idSet = new Set(this.memories.keys());
    idSet.delete(id);
    memoryValidator.validate(updated, idSet);

    this.memories.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  public delete(id: string): void {
    if (!this.memories.has(id)) {
      throw new Error(`Memory deletion error: Memory with ID "${id}" not found`);
    }
    this.memories.delete(id);
    this.saveToDisk();
  }

  public clear(): void {
    this.memories.clear();
    this.saveToDisk();
  }
}
