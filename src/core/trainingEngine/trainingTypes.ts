export type TrainingState =
  | 'Created'
  | 'Preparing'
  | 'Loading'
  | 'Training'
  | 'Validating'
  | 'Checkpointing'
  | 'Paused'
  | 'Resuming'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

export interface TrainingMetricsModel {
  epoch: number;
  batch: number;
  trainingLoss: number;
  validationLoss?: number;
  learningRate: number;
  gpuUsagePercent: number;
  ramUsageMB: number;
  vramUsageMB: number;
  tokensPerSec: number;
  elapsedSec: number;
  estimatedRemainingSec: number;
}

export interface TrainingSessionModel {
  sessionId: string;
  state: TrainingState;
  datasetVersion: string;
  tokenizerVersion: string;
  configurationVersion: string;
  currentEpoch: number;
  currentStep: number;
  totalEpochs: number;
  totalSteps: number;
  checkpointId?: string;
  experimentId?: string;
  startTime: number;
  endTime?: number;
  metrics: TrainingMetricsModel[];
}

export interface TrainingReportModel {
  sessionId: string;
  status: TrainingState;
  finalEpoch: number;
  finalStep: number;
  averageLoss: number;
  finalValidationLoss?: number;
  elapsedTimeSec: number;
  checkpointsSaved: string[];
}

export interface TrainingManifestModel {
  manifestId: string;
  sessionId: string;
  checksum: string;
  createdAt: number;
}

export enum TrainingEventType {
  TrainingStarted = 'TrainingStarted',
  EpochStarted = 'EpochStarted',
  BatchExecuted = 'BatchExecuted',
  EpochEnded = 'EpochEnded',
  ValidationExecuted = 'ValidationExecuted',
  CheckpointSaved = 'CheckpointSaved',
  ExperimentUpdated = 'ExperimentUpdated',
  TrainingEnded = 'TrainingEnded',
  TrainingStateChanged = 'TrainingStateChanged'
}

export interface TrainingEvent {
  type: TrainingEventType;
  timestamp: number;
  payload?: any;
}

export type TrainingEventListener = (event: TrainingEvent) => void;
