import * as vscode from 'vscode';
import { FilesystemEngine } from './filesystemEngine';
import { FileStat, FilesystemEventListener } from './filesystemTypes';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class FilesystemService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: FilesystemEngine | null = null;
  private pendingSubscriptions: FilesystemEventListener[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new FilesystemEngine(rootPath);
    this.state = 'READY';
    for (const listener of this.pendingSubscriptions) {
      this.activeEngine.subscribe(listener);
    }
    this.pendingSubscriptions = [];
  }

  public reset(): void {
    this.activeEngine = null;
    this.state = 'WAITING_FOR_WORKSPACE';
  }

  private getEngine(): FilesystemEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to the active filesystem events.
   */
  public subscribe(listener: FilesystemEventListener): () => void {
    const engine = this.getEngine();
    if (!engine) {
      this.pendingSubscriptions.push(listener);
      return () => {
        this.pendingSubscriptions = this.pendingSubscriptions.filter(l => l !== listener);
      };
    }
    return engine.subscribe(listener);
  }

  // --- Wrapper APIs ---

  public readFile(filePath: string): string {
    const engine = this.getEngine();
    if (!engine) return '';
    return engine.readFile(filePath);
  }

  public readDirectory(dirPath: string): string[] {
    const engine = this.getEngine();
    if (!engine) return [];
    return engine.readDirectory(dirPath);
  }

  public exists(targetPath: string): boolean {
    const engine = this.getEngine();
    if (!engine) return false;
    return engine.exists(targetPath);
  }

  public stat(targetPath: string): FileStat {
    const engine = this.getEngine();
    if (!engine) {
      return { isFile: false, isDirectory: false, size: 0, mtime: 0 };
    }
    return engine.stat(targetPath);
  }

  public createFile(filePath: string, content: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.createFile(filePath, content);
  }

  public updateFile(filePath: string, content: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.updateFile(filePath, content);
  }

  public deleteFile(targetPath: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.deleteFile(targetPath);
  }

  public createDirectory(dirPath: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.createDirectory(dirPath);
  }

  public rename(oldPath: string, newPath: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.rename(oldPath, newPath);
  }

  public move(oldPath: string, newPath: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.move(oldPath, newPath);
  }

  /**
   * Exposes raw operation logs.
   */
  public getLogs(): string[] {
    return this.activeEngine ? this.activeEngine.getLogs() : [];
  }
}

export const filesystemService = new FilesystemService();
export default filesystemService;
