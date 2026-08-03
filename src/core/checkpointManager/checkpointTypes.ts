export interface CheckpointModel {
  checkpointId: string;
  version: string;
  parentCheckpointId?: string;
  trainingStep: number;
  epoch: number;
  globalStep: number;
  optimizerState: {
    type: string;
    lr: number;
    step: number;
  };
  schedulerState: {
    type: string;
    lastEpoch: number;
  };
  randomSeeds: Record<string, number>;
  tokenizerVersion: string;
  datasetVersion: string;
  configurationVersion: string;
  evaluationResults: {
    validationLoss: number;
    trainingLoss: number;
    accuracy?: number;
  };
  creationTimestamp: number;
  checksum: string;
  isCompressed?: boolean;
}

export interface CheckpointManifestModel {
  manifestId: string;
  checkpointId: string;
  checksum: string;
  fileList: string[];
  createdAt: number;
}

export interface RetentionPolicyConfig {
  type: 'LatestN' | 'BestValidationScore' | 'BestTrainingLoss' | 'MilestoneCheckpoints' | 'TimeBased' | 'Manual';
  limitN?: number;
  milestoneSteps?: number[];
  timeLimitSec?: number;
}

export interface RecoveryReportModel {
  isRecoverable: boolean;
  checkpointId: string;
  issues: string[];
  restorationSteps: string[];
}

export enum CheckpointEventType {
  TrainingStateReceived = 'TrainingStateReceived',
  StateValidated = 'StateValidated',
  SnapshotCreated = 'SnapshotCreated',
  ManifestGenerated = 'ManifestGenerated',
  ArtifactCompressed = 'ArtifactCompressed',
  CheckpointStored = 'CheckpointStored',
  ArtifactRegistered = 'ArtifactRegistered',
  ReportsGenerated = 'ReportsGenerated'
}

export interface CheckpointEvent {
  type: CheckpointEventType;
  timestamp: number;
  payload?: any;
}

export type CheckpointEventListener = (event: CheckpointEvent) => void;
