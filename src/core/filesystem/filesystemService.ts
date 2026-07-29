import * as vscode from 'vscode';
import { FilesystemEngine } from './filesystemEngine';
import { FileStat, FilesystemEventListener } from './filesystemTypes';

export class FilesystemService {
  private activeEngine: FilesystemEngine | null = null;

  private getEngine(): FilesystemEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Filesystem Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new FilesystemEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to the active filesystem events.
   */
  public subscribe(listener: FilesystemEventListener): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public readFile(filePath: string): string {
    return this.getEngine().readFile(filePath);
  }

  public readDirectory(dirPath: string): string[] {
    return this.getEngine().readDirectory(dirPath);
  }

  public exists(targetPath: string): boolean {
    return this.getEngine().exists(targetPath);
  }

  public stat(targetPath: string): FileStat {
    return this.getEngine().stat(targetPath);
  }

  public createFile(filePath: string, content: string): void {
    this.getEngine().createFile(filePath, content);
  }

  public updateFile(filePath: string, content: string): void {
    this.getEngine().updateFile(filePath, content);
  }

  public deleteFile(targetPath: string): void {
    this.getEngine().deleteFile(targetPath);
  }

  public createDirectory(dirPath: string): void {
    this.getEngine().createDirectory(dirPath);
  }

  public rename(oldPath: string, newPath: string): void {
    this.getEngine().rename(oldPath, newPath);
  }

  public move(oldPath: string, newPath: string): void {
    this.getEngine().move(oldPath, newPath);
  }

  /**
   * Exposes raw operation logs.
   */
  public getLogs(): string[] {
    return this.activeEngine ? this.activeEngine.getLogs() : [];
  }
}

export const filesystemService = new FilesystemService();
