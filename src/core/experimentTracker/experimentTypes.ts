export interface ExperimentMetricsModel {
  trainingLoss?: number;
  validationLoss?: number;
  accuracy?: number;
  perplexity?: number;
  learningRate?: number;
  throughputTokensPerSec?: number;
  gpuUsagePercent?: number;
  ramUsageMB?: number;
  vramUsageMB?: number;
  trainingTimeSec?: number;
  checkpointCount?: number;
}

export interface ExperimentModel {
  experimentId: string;
  version: string;
  experimentType: 'Pretraining' | 'Instruction Tuning' | 'Fine-tuning' | 'Tokenizer Training' | 'Evaluation' | 'Benchmark' | 'Hyperparameter Search' | 'Inference Benchmark' | 'Custom Experiment' | string;
  trainingConfiguration: any;
  datasetVersion: string;
  tokenizerVersion: string;
  checkpointVersion?: string;
  hardwareProfile: any;
  randomSeed: number;
  evaluationResults: any;
  metrics: ExperimentMetricsModel;
  artifacts: string[]; // filePaths of weights, logs, configs
  status: 'running' | 'completed' | 'failed' | string;
  creationTime: number;
}

export interface ExperimentManifestModel {
  manifestId: string;
  experimentId: string;
  version: string;
  checksum: string;
  artifactHashes: Record<string, string>; // filePath to SHA-256
  createdAt: number;
}

export interface ReplayReportModel {
  isReproducible: boolean;
  experimentId: string;
  seedTested: number;
  environmentMatches: boolean;
  mismatches: string[];
}

export enum ExperimentEventType {
  ExperimentCreated = 'ExperimentCreated',
  ArtifactsRegistered = 'ArtifactsRegistered',
  MetricsTracked = 'MetricsTracked',
  EventsRecorded = 'EventsRecorded',
  ReportsGenerated = 'ReportsGenerated',
  ResultsCompared = 'ResultsCompared',
  HistoryStored = 'HistoryStored',
  ReplayEnabled = 'ReplayEnabled'
}

export interface ExperimentEvent {
  type: ExperimentEventType;
  timestamp: number;
  payload?: any;
}

export type ExperimentEventListener = (event: ExperimentEvent) => void;
