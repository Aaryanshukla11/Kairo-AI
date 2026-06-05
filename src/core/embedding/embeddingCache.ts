import { createHash } from 'crypto';
import { EmbeddingObject } from './embeddingTypes';

export class EmbeddingCache {
  private cache = new Map<string, EmbeddingObject>();

  /**
   * Generates MD5 hex hash from content text.
   */
  public getChecksum(content: string): string {
    return createHash('md5').update(content, 'utf8').digest('hex');
  }

  /**
   * Returns cached embedding if checksum values match.
   */
  public get(sourceId: string, checksum: string): EmbeddingObject | null {
    const cached = this.cache.get(sourceId);
    if (cached && cached.checksum === checksum) {
      return cached;
    }
    return null;
  }

  public set(sourceId: string, obj: EmbeddingObject): void {
    this.cache.set(sourceId, obj);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getAll(): EmbeddingObject[] {
    return Array.from(this.cache.values());
  }
}

export const embeddingCache = new EmbeddingCache();
