import { PathResolver } from './pathResolver';
import { fileReader } from './fileReader';
import { fileWriter } from './fileWriter';
import { directoryManager } from './directoryManager';
import { FileStat, FilesystemEventType, FilesystemEvent, FilesystemEventListener } from './filesystemTypes';

export class FilesystemEngine {
  private resolver: PathResolver;
  private listeners = new Set<FilesystemEventListener>();
  private logs: string[] = [];

  constructor(workspaceRoot: string) {
    this.resolver = new PathResolver(workspaceRoot);
  }

  /**
   * Subscribes a listener to filesystem events.
   */
  public subscribe(listener: FilesystemEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: FilesystemEventType, path: string, payload?: any): void {
    const event: FilesystemEvent = {
      type,
      path: this.resolver.normalize(path),
      timestamp: Date.now(),
      payload
    };
    this.logs.push(`[${new Date().toISOString()}] Event ${type}: ${event.path}`);
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in filesystem listener:', err);
      }
    }
  }

  // --- READ API ---

  public readFile(filePath: string): string {
    const resolved = this.resolver.resolve(filePath);
    const result = fileReader.readFile(resolved);
    this.emit(FilesystemEventType.FileRead, resolved);
    return result;
  }

  public readDirectory(dirPath: string): string[] {
    const resolved = this.resolver.resolve(dirPath);
    return fileReader.readDirectory(resolved);
  }

  public exists(targetPath: string): boolean {
    const resolved = this.resolver.resolve(targetPath);
    return fileReader.exists(resolved);
  }

  public stat(targetPath: string): FileStat {
    const resolved = this.resolver.resolve(targetPath);
    return fileReader.stat(resolved);
  }

  // --- WRITE API ---

  public createFile(filePath: string, content: string): void {
    const resolved = this.resolver.resolve(filePath);
    fileWriter.createFile(resolved, content);
    this.emit(FilesystemEventType.FileCreated, resolved);
  }

  public updateFile(filePath: string, content: string): void {
    const resolved = this.resolver.resolve(filePath);
    fileWriter.updateFile(resolved, content);
    this.emit(FilesystemEventType.FileUpdated, resolved);
  }

  public deleteFile(targetPath: string): void {
    const resolved = this.resolver.resolve(targetPath);
    fileWriter.deleteFile(resolved);
    this.emit(FilesystemEventType.FileDeleted, resolved);
  }

  public createDirectory(dirPath: string): void {
    const resolved = this.resolver.resolve(dirPath);
    directoryManager.createDirectory(resolved);
    this.emit(FilesystemEventType.DirectoryCreated, resolved);
  }

  public rename(oldPath: string, newPath: string): void {
    const resolvedOld = this.resolver.resolve(oldPath);
    const resolvedNew = this.resolver.resolve(newPath);
    fileWriter.rename(resolvedOld, resolvedNew);
    this.emit(FilesystemEventType.FileDeleted, resolvedOld);
    this.emit(FilesystemEventType.FileCreated, resolvedNew);
  }

  public move(oldPath: string, newPath: string): void {
    const resolvedOld = this.resolver.resolve(oldPath);
    const resolvedNew = this.resolver.resolve(newPath);
    fileWriter.move(resolvedOld, resolvedNew);
    this.emit(FilesystemEventType.FileDeleted, resolvedOld);
    this.emit(FilesystemEventType.FileCreated, resolvedNew);
  }

  public getLogs(): string[] {
    return this.logs;
  }
}
