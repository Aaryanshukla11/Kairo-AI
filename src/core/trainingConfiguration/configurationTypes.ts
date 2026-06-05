export interface TrainingHyperparameters {
  optimizer: 'AdamW' | 'SGD' | 'Adafactor' | string;
  scheduler: 'cosine' | 'linear' | 'constant' | string;
  precision: 'fp32' | 'fp16' | 'bf16' | string;
  batchSize: number;
  gradientAccumulation: number;
  learningRate: number;
  warmupRatio: number;
  epochs: number;
  randomSeed: number;
  gradientClipping?: number;
  mixedPrecision: boolean;
}

export interface HardwareProfile {
  deviceType: 'cpu' | 'cuda' | 'tpu' | string;
  deviceCount: number;
  precisionSupported: string[];
  maxBatchSize: number;
}

export interface TrainingConfigModel {
  configId: string;
  version: string;
  parentVersion?: string;
  trainingType: 'Pretraining' | 'Instruction Tuning' | 'Fine-tuning' | 'Continued Pretraining' | 'Evaluation' | 'Experimental' | string;
  datasetVersion: string;
  tokenizerVersion: string;
  modelArchitecture: string;
  hyperparameters: TrainingHyperparameters;
  hardwareProfile: HardwareProfile;
  checkpointFrequency: number; // in steps or epochs
  evaluationFrequency: number;
  createdAt: number;
}

export interface ConfigManifestModel {
  manifestId: string;
  configId: string;
  version: string;
  checksum: string;
  createdAt: number;
}

export interface ValidationReportModel {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export enum ConfigEventType {
  RequestReceived = 'RequestReceived',
  ConfigurationBuilt = 'ConfigurationBuilt',
  ParametersValidated = 'ParametersValidated',
  ManifestGenerated = 'ManifestGenerated',
  ConfigurationRegistered = 'ConfigurationRegistered',
  ConfigurationVersioned = 'ConfigurationVersioned',
  ReportsPublished = 'ReportsPublished'
}

export interface ConfigEvent {
  type: ConfigEventType;
  timestamp: number;
  payload?: any;
}

export type ConfigEventListener = (event: ConfigEvent) => void;
