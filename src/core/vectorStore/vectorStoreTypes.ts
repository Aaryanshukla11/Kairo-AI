import { EmbeddingSourceType } from '../embedding/embeddingTypes';

export interface VectorRecord {
  id: string;
  embeddingId: string;
  sourceId: string;
  sourceType: EmbeddingSourceType;
  provider: string;
  dimensions: number;
  metadata: Record<string, any>;
  checksum: string;
  createdAt: number;
  updatedAt: number;
  vector: number[];
}

export interface SimilarityResult {
  record: VectorRecord;
  score: number;
}

export enum SimilarityMetric {
  Cosine = 'Cosine',
  DotProduct = 'DotProduct',
  Euclidean = 'Euclidean'
}

export enum VectorStoreEventType {
  VectorInserted = 'VectorInserted',
  VectorUpdated = 'VectorUpdated',
  VectorDeleted = 'VectorDeleted',
  VectorLoaded = 'VectorLoaded',
  VectorStoreReady = 'VectorStoreReady'
}

export interface VectorStoreEvent {
  type: VectorStoreEventType;
  vectorId?: string;
  timestamp: number;
  payload?: any;
}

export type VectorStoreEventListener = (event: VectorStoreEvent) => void;
