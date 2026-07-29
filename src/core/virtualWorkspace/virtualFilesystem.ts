import { VirtualFile, VirtualDirectory } from './virtualWorkspaceTypes';

export class VirtualFilesystem {
  private root: VirtualDirectory = {
    path: '/',
    files: new Map(),
    subdirectories: new Map()
  };

  public reset(): void {
    this.root = {
      path: '/',
      files: new Map(),
      subdirectories: new Map()
    };
  }

  public getRoot(): VirtualDirectory {
    return this.root;
  }

  public write(filePath: string, content: string): void {
    this.root.files.set(filePath, { path: filePath, content });
  }

  public read(filePath: string): string | undefined {
    return this.root.files.get(filePath)?.content;
  }

  public delete(filePath: string): boolean {
    return this.root.files.delete(filePath);
  }

  public listFiles(): string[] {
    return Array.from(this.root.files.keys());
  }
}
export const virtualFilesystem = new VirtualFilesystem();
