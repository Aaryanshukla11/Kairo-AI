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
  private workspaceRoot?: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot;
  }

  public resolveSafeWorkspacePath(candidatePath: string): string {
    let targetRoot: string = this.workspaceRoot || '';
    if (!targetRoot) {
      try {
        const vscode = require('vscode');
        const folders = vscode?.workspace?.workspaceFolders;
        if (folders && folders.length > 0) {
          targetRoot = folders[0].uri.fsPath;
        }
      } catch {}
    }
    if (!targetRoot) {
      targetRoot = process.cwd();
    }

    const canonicalRoot = path.resolve(targetRoot);

    let cleanCandidate = candidatePath || '';
    // Strip leading slashes if candidate is not a drive-letter absolute path (e.g. C:\...)
    if (!path.isAbsolute(cleanCandidate)) {
      cleanCandidate = cleanCandidate.replace(/^[/\\]+/, '');
    }

    const normalizedCandidate = path.isAbsolute(cleanCandidate)
      ? path.resolve(cleanCandidate)
      : path.resolve(canonicalRoot, cleanCandidate);

    const relative = path.relative(canonicalRoot, normalizedCandidate);

    const isOutside =
      relative === '..' ||
      relative.startsWith(`..${path.sep}`) ||
      relative.startsWith('../') ||
      relative.startsWith('..\\') ||
      (path.isAbsolute(relative) && !normalizedCandidate.startsWith(canonicalRoot));

    if (isOutside) {
      throw new Error(`Security Violation: Operation targets path "${candidatePath}" outside workspace root boundary "${canonicalRoot}".`);
    }

    // Physical Realpath Validation (Symlink / Reparse Point / Junction Defense-in-Depth)
    try {
      let realRoot = canonicalRoot;
      if (fs.existsSync(canonicalRoot)) {
        realRoot = fs.realpathSync(canonicalRoot);
      }

      let checkPath = normalizedCandidate;
      while (checkPath && !fs.existsSync(checkPath)) {
        const parent = path.dirname(checkPath);
        if (parent === checkPath) {
          break;
        }
        checkPath = parent;
      }

      if (fs.existsSync(checkPath)) {
        const realCheckPath = fs.realpathSync(checkPath);
        const relReal = path.relative(realRoot, realCheckPath);
        const isRealOutside =
          relReal === '..' ||
          relReal.startsWith(`..${path.sep}`) ||
          relReal.startsWith('../') ||
          relReal.startsWith('..\\') ||
          (path.isAbsolute(relReal) && !realCheckPath.startsWith(realRoot));

        if (isRealOutside) {
          throw new Error(`Security Violation: Target path "${candidatePath}" resolves via symlink/junction outside workspace boundary "${canonicalRoot}".`);
        }
      }
    } catch (err: any) {
      if (err.message && err.message.startsWith('Security Violation:')) {
        throw err;
      }
    }

    return normalizedCandidate;
  }

  public async exists(filePath: string): Promise<boolean> {
    try {
      const safePath = this.resolveSafeWorkspacePath(filePath);
      return fs.existsSync(safePath);
    } catch {
      return false;
    }
  }

  public async readFile(filePath: string): Promise<string> {
    const safePath = this.resolveSafeWorkspacePath(filePath);
    return fs.promises.readFile(safePath, 'utf-8');
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    const executionId = `fs-write-${Date.now()}`;
    const startTime = Date.now();
    logKairoStage('Filesystem', 'ENTER', executionId, { filePath, contentSize: content?.length || 0 });

    try {
      const { globalKairoEventBus } = require('../eventBus');
      await globalKairoEventBus.publish({
        eventId: `evt-fws-${executionId}`,
        eventType: 'FileWriteStarted',
        timestamp: Date.now(),
        source: 'NodeFsAdapter',
        priority: 'HIGH',
        payload: { filePath, stage: 'Writing file to workspace' }
      });

      const safePath = this.resolveSafeWorkspacePath(filePath);
      const dir = path.dirname(safePath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      await fs.promises.writeFile(safePath, content, 'utf-8');

      // Notify VS Code File System Provider if running in extension host
      try {
        const vscode = require('vscode');
        if (vscode && vscode.workspace && vscode.workspace.fs && vscode.Uri) {
          const uri = vscode.Uri.file(safePath);
          try {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
          } catch {}
          try {
            await vscode.commands.executeCommand('workbench.action.files.refresh');
          } catch {}
        }
      } catch {}

      await globalKairoEventBus.publish({
        eventId: `evt-fwc-${executionId}`,
        eventType: 'FileWriteCompleted',
        timestamp: Date.now(),
        source: 'NodeFsAdapter',
        priority: 'HIGH',
        payload: { filePath, safePath, bytesWritten: Buffer.byteLength(content, 'utf-8'), stage: 'File written' }
      });

      const duration = Date.now() - startTime;
      logKairoStage('Filesystem', 'EXIT', executionId, { filePath: safePath }, { success: true }, duration);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logKairoStage('Filesystem', 'ERROR', executionId, { filePath }, null, duration, error);
      try {
        const { globalKairoEventBus } = require('../eventBus');
        await globalKairoEventBus.publish({
          eventId: `evt-fwf-${executionId}`,
          eventType: 'FileWriteFailed',
          timestamp: Date.now(),
          source: 'NodeFsAdapter',
          priority: 'HIGH',
          payload: { filePath, error: error.message || String(error), stage: 'File write failed' }
        });
      } catch {}
      throw error;
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    const safePath = this.resolveSafeWorkspacePath(filePath);
    if (fs.existsSync(safePath)) {
      await fs.promises.unlink(safePath);
    }
  }

  public async createDir(dirPath: string): Promise<void> {
    const safePath = this.resolveSafeWorkspacePath(dirPath);
    await fs.promises.mkdir(safePath, { recursive: true });
  }

  public async deleteDir(dirPath: string): Promise<void> {
    const safePath = this.resolveSafeWorkspacePath(dirPath);
    if (fs.existsSync(safePath)) {
      await fs.promises.rm(safePath, { recursive: true, force: true });
    }
  }

  public async rename(oldPath: string, newPath: string): Promise<void> {
    const safeOld = this.resolveSafeWorkspacePath(oldPath);
    const safeNew = this.resolveSafeWorkspacePath(newPath);
    await fs.promises.rename(safeOld, safeNew);
  }
}

export const nodeFsAdapter = new NodeFsAdapter();

