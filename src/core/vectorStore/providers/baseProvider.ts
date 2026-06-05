import { VectorRecord, SimilarityResult, SimilarityMetric } from '../vectorStoreTypes';

export interface VectorStoreProvider {
  name: string;
  insert(record: VectorRecord): void;
  update(record: VectorRecord): void;
  delete(id: string): void;
  get(id: string): VectorRecord | null;
  list(): VectorRecord[];
  clear(): void;
  similaritySearch(queryVector: number[], limit: number, metric: SimilarityMetric): SimilarityResult[];
}
