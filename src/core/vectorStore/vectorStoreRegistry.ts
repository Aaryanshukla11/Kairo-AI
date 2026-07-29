import * as fs from 'fs';
import * as path from 'path';

export interface VectorStoreStats {
  storedCount: number;
  dimensions: number;
  provider: string;
  storageSizeBytes: number;
  cacheHitRate: number;
  isReady: boolean;
}

export class VectorStoreRegistry {
  /**
   * Evaluates size boundaries and counts to build stats details.
   */
  public getStats(workspaceRoot: string, storedCount: number, dimensions: number, providerName: string, cacheHitRate: number): VectorStoreStats {
    const file = path.join(workspaceRoot, '.aiidle', 'vectorStore', 'index.json');
    let size = 0;
    if (fs.existsSync(file)) {
      size = fs.statSync(file).size;
    }

    return {
      storedCount,
      dimensions,
      provider: providerName,
      storageSizeBytes: size,
      cacheHitRate,
      isReady: true
    };
  }
}

export const vectorStoreRegistry = new VectorStoreRegistry();
