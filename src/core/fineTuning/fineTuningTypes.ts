export type FineTuningMethod =
  | 'full'
  | 'lora'
  | 'qlora'
  | 'continued_pretraining'
  | 'instruction_tuning';

export interface LoRAConfig {
  r: number;
  alpha: number;
  dropout: number;
  targetModules: string[];
  bias: 'none' | 'all' | 'lora_only';
}

export interface QLoRAConfig extends LoRAConfig {
  quantType: 'nf4' | 'fp4';
  doubleQuant: boolean;
  computeDtype: 'fp16' | 'bf16' | 'fp32';
}

export interface TrainableParametersReport {
  totalParameters: number;
  trainableParameters: number;
  percentageTrainable: number;
  frozenParameters: number;
  adapterParameters: number;
}

export interface FineTuningSessionModel {
  sessionId: string;
  baseModelId: string;
  method: FineTuningMethod;
  status: 'initialized' | 'active' | 'paused' | 'completed' | 'failed';
  currentEpoch: number;
  currentStep: number;
  totalEpochs: number;
  totalSteps: number;
  trainableParams: TrainableParametersReport;
  loraConfig?: LoRAConfig;
  qloraConfig?: QLoRAConfig;
  checkpointId?: string;
  startTime: number;
}

export interface FineTuningMetricModel {
  epoch: number;
  step: number;
  trainingLoss: number;
  validationLoss: number;
  learningRate: number;
  gpuUsagePercent: number;
  vramUsageMB: number;
  elapsedSec: number;
}

export interface FineTuningReport {
  reportId: string;
  sessionId: string;
  metrics: FineTuningMetricModel[];
  trainableParams: TrainableParametersReport;
  completedAt: number;
  isResumable: boolean;
}

export interface FineTuningManifest {
  sessionId: string;
  method: FineTuningMethod;
  baseModelId: string;
  datasetVersion: string;
  tokenizerVersion: string;
  configChecksum: string;
  checksum: string; // sha256 checksum of fine-tuning session report
  timestamp: number;
}

export enum FineTuningEventType {
  LoadBaseModel = 'LoadBaseModel',
  LoadDataset = 'LoadDataset',
  LoadConfiguration = 'LoadConfiguration',
  LoadAdapter = 'LoadAdapter',
  InitializeSession = 'InitializeSession',
  ExecuteStep = 'ExecuteStep',
  ValidationPass = 'ValidationPass',
  CheckpointSaved = 'CheckpointSaved',
  ExperimentUpdated = 'ExperimentUpdated',
  Completion = 'Completion'
}

export interface FineTuningEvent {
  type: FineTuningEventType;
  timestamp: number;
  sessionId: string;
  payload: any;
}

export type FineTuningEventListener = (event: FineTuningEvent) => void;
