import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import { ProvenanceModel } from '../datasetCollector/collectorTypes';

export interface Fingerprint {
  exactHash: string;
  structuralHash: string; // AST or token-based structural summary
  minHashes: number[];     // For semantic minhash / shingling
}

export interface DuplicateCluster {
  clusterId: string;
  representativeSample: CleanedSample;
  duplicateSamples: CleanedSample[];
  similarityScores: Record<string, number>; // Maps sampleId to similarity score
  languages: string[];
  qualityScores: Record<string, number>;    // Maps sampleId to quality score
  provenance: Record<string, ProvenanceModel>; // Maps sampleId to its provenance record
  resolutionDecision: string;
}

export enum DeduplicationEventType {
  DeduplicationStarted = 'DeduplicationStarted',
  FingerprintsGenerated = 'FingerprintsGenerated',
  ExactMatchingCompleted = 'ExactMatchingCompleted',
  StructuralAnalysisCompleted = 'StructuralAnalysisCompleted',
  SemanticSimilarityCompleted = 'SemanticSimilarityCompleted',
  ClustersFormed = 'ClustersFormed',
  DuplicatesResolved = 'DuplicatesResolved',
  DeduplicationCompleted = 'DeduplicationCompleted'
}

export interface DeduplicationEvent {
  type: DeduplicationEventType;
  timestamp: number;
  payload?: any;
}

export type DeduplicationEventListener = (event: DeduplicationEvent) => void;

export interface DeduplicationConfig {
  exactMatchThreshold: number;      // e.g. 1.0 (exact hash)
  structuralThreshold: number;      // e.g. 0.85 (jaccard token token overlap)
  semanticThreshold: number;        // e.g. 0.80 (minhash/embedding jaccard)
  minHashKSize?: number;            // K-shingle length
  minHashBandCount?: number;        // MinHash shingle parameters
}

export interface DeduplicationReportModel {
  runId: string;
  datasetId: string;
  timestamp: number;
  totalInputSamples: number;
  deduplicatedCount: number;
  duplicatesFound: number;
  spaceSavedBytes: number;
  clustersCount: number;
  exactDuplicatesCount: number;
  structuralDuplicatesCount: number;
  semanticDuplicatesCount: number;
}
