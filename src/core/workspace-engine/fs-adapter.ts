export interface IFilesystemAdapter {
  exists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  createDir(path: string): Promise<void>;
  deleteDir(path: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
}

export class InMemoryFsAdapter implements IFilesystemAdapter {
  private files: Map<string, string> = new Map();
  private dirs: Set<string> = new Set();

  public async exists(path: string): Promise<boolean> {
    return this.files.has(path) || this.dirs.has(path);
  }

  public async readFile(path: string): Promise<string> {
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    return this.files.get(path)!;
  }

  public async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  public async deleteFile(path: string): Promise<void> {
    this.files.delete(path);
  }

  public async createDir(path: string): Promise<void> {
    this.dirs.add(path);
  }

  public async deleteDir(path: string): Promise<void> {
    this.dirs.delete(path);
  }

  public async rename(oldPath: string, newPath: string): Promise<void> {
    if (this.files.has(oldPath)) {
      const content = this.files.get(oldPath)!;
      this.files.delete(oldPath);
      this.files.set(newPath, content);
    } else if (this.dirs.has(oldPath)) {
      this.dirs.delete(oldPath);
      this.dirs.add(newPath);
    } else {
      throw new Error(`Path not found for rename: ${oldPath}`);
    }
  }

  // Helper for tests to initialize virtual file entries
  public setFile(path: string, content: string): void {
    this.files.set(path, content);
  }
}

import * as fs from 'fs';
import * as path from 'path';
import { logKairoStage } from '../../common/kairoLogger';

export class NodeFsAdapter implements IFilesystemAdapter {
  public async exists(filePath: string): Promise<boolean> {
    return fs.existsSync(filePath);
  }

  public async readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8');
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    const executionId = `fs-write-${Date.now()}`;
    const startTime = Date.now();
    logKairoStage('Filesystem', 'ENTER', executionId, { filePath, contentSize: content?.length || 0 });

    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      await fs.promises.writeFile(filePath, content, 'utf-8');
      const duration = Date.now() - startTime;
      logKairoStage('Filesystem', 'EXIT', executionId, { filePath }, { success: true }, duration);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logKairoStage('Filesystem', 'ERROR', executionId, { filePath }, null, duration, error);
      throw error;
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  public async createDir(dirPath: string): Promise<void> {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }

  public async deleteDir(dirPath: string): Promise<void> {
    if (fs.existsSync(dirPath)) {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
    }
  }

  public async rename(oldPath: string, newPath: string): Promise<void> {
    await fs.promises.rename(oldPath, newPath);
  }
}

