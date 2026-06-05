import { CheckpointModel } from '../checkpointTypes';

export class FilesystemProvider {
  private filesRegistry = new Map<string, string>();

  public writeFile(filePath: string, content: string): void {
    this.filesRegistry.set(filePath, content);
  }

  public readFile(filePath: string): string | undefined {
    return this.filesRegistry.get(filePath);
  }

  public deleteFile(filePath: string): void {
    this.filesRegistry.delete(filePath);
  }

  public listFiles(): string[] {
    return Array.from(this.filesRegistry.keys());
  }

  public clear(): void {
    this.filesRegistry.clear();
  }
}

export const filesystemProvider = new FilesystemProvider();
export default filesystemProvider;
