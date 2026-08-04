import { CollectedFileItem, ProvenanceModel } from '../datasetCollector/collectorTypes';
export { CollectedFileItem, ProvenanceModel };

export interface CleanedSample {
  filePath: string;
  content: string;
  originalSizeBytes: number;
  cleanedSizeBytes: number;
  provenance: ProvenanceModel;
  qualityScore: number;
  normalizationsApplied: string[];
}

export interface RejectedSample {
  filePath: string;
  originalContent: string;
  provenance: ProvenanceModel;
  rejectionReasons: string[];
}

export interface NormalizationSummary {
  utf8NormalizedCount: number;
  lineEndingsNormalizedCount: number;
  whitespaceNormalizedCount: number;
  filenamesNormalizedCount: number;
  languagesNormalizedCount: number;
  metadataNormalizedCount: number;
}

export interface QualityMetrics {
  averageQualityScore: number;
  syntaxValidityCount: number;
  metadataCompletenessCount: number;
  formattingConsistencyCount: number;
  encodingQualityCount: number;
  sampleCompletenessCount: number;
}

export interface CleaningReportModel {
  pipelineRunId: string;
  datasetId: string;
  timestamp: number;
  samplesProcessed: number;
  acceptedCount: number;
  rejectedCount: number;
  normalizationSummary: NormalizationSummary;
  qualityMetrics: QualityMetrics;
  rejectionReasonsDistribution: Record<string, number>;
  qualityDistribution: Record<string, number>;
}

export enum CleaningEventType {
  PipelineStarted = 'PipelineStarted',
  SampleValidated = 'SampleValidated',
  EncodingNormalized = 'EncodingNormalized',
  MetadataNormalized = 'MetadataNormalized',
  FormattingNormalized = 'FormattingNormalized',
  CorruptionDetected = 'CorruptionDetected',
  SampleRepaired = 'SampleRepaired',
  QualityScored = 'QualityScored',
  PipelineCompleted = 'PipelineCompleted'
}

export interface CleaningEvent {
  type: CleaningEventType;
  timestamp: number;
  payload?: any;
}

export type CleaningEventListener = (event: CleaningEvent) => void;

export interface CleaningRulesConfig {
  rejectCorrupted: boolean;
  rejectUnreadable: boolean;
  rejectUnknownEncoding: boolean;
  rejectMissingMetadata: boolean;
  rejectUnsupportedFormats: boolean;
  rejectEmptySamples: boolean;
  minQualityScoreAllowed?: number;
}
