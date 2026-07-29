import { VectorStoreProvider } from './baseProvider';
import { VectorRecord, SimilarityResult, SimilarityMetric } from '../vectorStoreTypes';
import { calculateSimilarity } from '../similarity';

export class MemoryProvider implements VectorStoreProvider {
  public name = 'MemoryStoreProvider';
  private records = new Map<string, VectorRecord>();

  public insert(record: VectorRecord): void {
    if (this.records.has(record.id)) {
      throw new Error(`Vector ID duplicate error: "${record.id}" already exists`);
    }
    this.records.set(record.id, record);
  }

  public update(record: VectorRecord): void {
    if (!this.records.has(record.id)) {
      throw new Error(`Vector update failed: ID "${record.id}" does not exist`);
    }
    this.records.set(record.id, record);
  }

  public delete(id: string): void {
    this.records.delete(id);
  }

  public get(id: string): VectorRecord | null {
    return this.records.get(id) || null;
  }

  public list(): VectorRecord[] {
    return Array.from(this.records.values());
  }

  public clear(): void {
    this.records.clear();
  }

  /**
   * Evaluates scores against stored records and returns sorted listings.
   */
  public similaritySearch(queryVector: number[], limit: number, metric: SimilarityMetric): SimilarityResult[] {
    const results: SimilarityResult[] = [];
    
    for (const record of this.records.values()) {
      if (record.vector.length !== queryVector.length) continue;
      const score = calculateSimilarity(record.vector, queryVector, metric);
      results.push({ record, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}
