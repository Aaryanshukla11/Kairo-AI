export interface IWorkspaceAdapter {
  writeFile(filePath: string, content: string): Promise<void>;
  readFile(filePath: string): Promise<string>;
}

export class InMemoryWorkspaceAdapter implements IWorkspaceAdapter {
  private files = new Map<string, string>();

  public async writeFile(filePath: string, content: string): Promise<void> {
    this.files.set(filePath, content);
  }

  public async readFile(filePath: string): Promise<string> {
    return this.files.get(filePath) || '';
  }

  public getFiles(): Record<string, string> {
    const obj: Record<string, string> = {};
    this.files.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }
}
