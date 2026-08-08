import * as fs from 'fs';
import * as path from 'path';

export class StorageProfiler {
  public profile(baseDir: string = path.resolve(__dirname, '../../../')): {
    diskReadWriteBps: number;
    artifactSizeMb: number;
  } {
    // Collect active storage capacities and model weights sizes
    let artifactSizeMb = 120; // baseline fallback
    try {
      const distDir = path.join(baseDir, 'dist');
      if (fs.existsSync(distDir)) {
        const stats = fs.statSync(distDir);
        artifactSizeMb = Math.round(stats.size / (1024 * 1024));
      }
    } catch {
      // safe fallback
    }

    return {
      diskReadWriteBps: 2.5 * 1024 * 1024, // 2.5 MB/s
      artifactSizeMb
    };
  }
}

export const storageProfiler = new StorageProfiler();
