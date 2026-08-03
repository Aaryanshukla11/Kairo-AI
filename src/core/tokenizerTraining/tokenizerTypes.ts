export interface TokenizerConfig {
  vocabSize: number;
  characterCoverage?: number;
  normalizationRules?: string[];
  pretokenizationRules?: string[];
  specialTokens: string[];
  reservedTokens?: string[];
  unknownTokenStrategy?: 'replace' | 'reject' | 'split';
  algorithm: 'SentencePiece' | 'BPE' | 'Unigram' | 'WordPiece' | string;
}

export interface TokenizerArtifact {
  artifactId: string;
  datasetId: string;
  version: string;
  algorithm: string;
  vocab: Record<string, number>;
  mergeRules: string[];
  config: TokenizerConfig;
  createdAt: number;
}

export interface TokenizerManifestModel {
  manifestId: string;
  artifactId: string;
  datasetId: string;
  version: string;
  vocabSize: number;
  checksum: string;
  createdAt: number;
  supportedAlgorithms: string[];
}

export interface BenchmarkReportModel {
  runId: string;
  artifactId: string;
  compressionRatio: number;
  avgTokensPerFile: number;
  vocabCoverage: number;
  unknownTokenRate: number;
  encodingSpeedKPS: number; // Keys per second
  decodingSpeedKPS: number;
  memoryUsageBytes: number;
}

export interface EvaluationReportModel {
  runId: string;
  artifactId: string;
  isVocabComplete: boolean;
  areSpecialTokensValid: boolean;
  noDuplicateTokens: boolean;
  isEncodingStable: boolean;
  isDecodingStable: boolean;
  errors: string[];
}

export enum TokenizerEventType {
  TrainingStarted = 'TrainingStarted',
  TextNormalized = 'TextNormalized',
  TokenizerTrained = 'TokenizerTrained',
  VocabValidated = 'VocabValidated',
  BenchmarkCompleted = 'BenchmarkCompleted',
  ReportsGenerated = 'ReportsGenerated',
  TokenizerRegistered = 'TokenizerRegistered',
  ArtifactVersioned = 'ArtifactVersioned'
}

export interface TokenizerEvent {
  type: TokenizerEventType;
  timestamp: number;
  payload?: any;
}

export type TokenizerEventListener = (event: TokenizerEvent) => void;
