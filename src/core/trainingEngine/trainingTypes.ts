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
  totalBatches: number;
  trainingLoss: number;
  validationLoss: number;
  learningRate: number;
  tokensPerSec: number;
  gpuUsagePercent: number;
  ramUsageMB: number;
  vramUsageMB: number;
  elapsedTimeSec: number;
  etaSeconds: number;
}

export interface TrainingSessionModel {
  sessionId: string;
  datasetVersion: string;
  tokenizerVersion: string;
  configVersion: string;
  parentCheckpointId?: string;
  experimentId?: string;
  currentState: TrainingState;
  currentEpoch: number;
  currentStep: number;
  metricsHistory: TrainingMetricsModel[];
  createdAt: number;
  updatedAt: number;
}

export interface TrainingReportModel {
  sessionId: string;
  status: TrainingState;
  totalEpochs: number;
  totalSteps: number;
  finalTrainingLoss: number;
  finalValidationLoss: number;
  checkpointsSaved: string[];
  durationSeconds: number;
}

export enum TrainingEventType {
  StateChanged = 'StateChanged',
  EpochStarted = 'EpochStarted',
  EpochCompleted = 'EpochCompleted',
  BatchCompleted = 'BatchCompleted',
  CheckpointSaved = 'CheckpointSaved',
  ErrorEncountered = 'ErrorEncountered'
}

export interface TrainingEvent {
  type: TrainingEventType;
  timestamp: number;
  payload?: any;
}

export type TrainingEventListener = (event: TrainingEvent) => void;
