import * as fs from 'fs';
import * as path from 'path';
import { VectorRecord } from './vectorStoreTypes';

export class VectorStorePersistence {
  private filePath: string;

  constructor(workspaceRoot: string) {
    const hasWorkspaceAiidle = fs.existsSync(path.resolve(workspaceRoot, '.aiidle'));
    this.filePath = hasWorkspaceAiidle
      ? path.join(workspaceRoot, '.aiidle', 'vectorStore', 'index.json')
      : path.join(require('os').tmpdir(), 'kairo-vectorstore', path.basename(workspaceRoot), 'index.json');
  }

  /**
   * Serializes active vectors to disk.
   */
  public save(records: VectorRecord[]): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save vector store index file:', err);
    }
  }

  /**
   * Deserializes indices from disk.
   */
  public load(): VectorRecord[] {
    if (fs.existsSync(this.filePath)) {
      try {
        const content = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(content) as VectorRecord[];
      } catch (err) {
        console.error('Failed to parse vector store index file:', err);
        return [];
      }
    }
    return [];
  }
}
