export type OptimizerType = 'Adam' | 'AdamW' | 'SGD' | 'Lion' | 'Future Optimizers';

export type LrScheduleType =
  | 'Constant'
  | 'Linear'
  | 'Cosine'
  | 'Cosine Restart'
  | 'Polynomial'
  | 'Exponential'
  | 'Step Decay'
  | 'Custom Scheduler';

export interface OptimizerStateModel {
  optimizerType: OptimizerType;
  stepCount: number;
  learningRate: number;
  weightDecay: number;
  momentum: number; // SGD momentum or Adam beta1
  movingAverageSq: number; // Adam beta2
  gradientStats: {
    norm: number;
    mean: number;
    variance: number;
  };
}

export interface OptimizerReportModel {
  reportId: string;
  sessionId: string;
  optimizerType: OptimizerType;
  learningRate: number;
  stepCount: number;
  parametersUpdatedCount: number;
  createdAt: number;
}

export interface LrReportModel {
  scheduleType: LrScheduleType;
  currentLr: number;
  step: number;
  totalSteps: number;
}

export interface ParameterUpdateReportModel {
  reportId: string;
  updatesNorm: number;
  ratioUpdated: number; // parameter weight update ratio e.g., updates_norm / params_norm
  isValid: boolean;
}

export interface OptimizerPolicyConfig {
  weightDecayPolicy: 'L2' | 'Decoupled' | 'None';
  lrWarmupSteps: number;
}

export interface ValidationReportModel {
  isValid: boolean;
  errors: string[];
}

export interface OptimizerManifestModel {
  manifestId: string;
  sessionId: string;
  checksum: string;
  createdAt: number;
}

export enum OptimizerEventType {
  GradientsReceived = 'GradientsReceived',
  Validated = 'Validated',
  StateLoaded = 'StateLoaded',
  UpdatesApplied = 'UpdatesApplied',
  LrUpdated = 'LrUpdated',
  ParametersValidated = 'ParametersValidated',
  StateStored = 'StateStored',
  ReportsGenerated = 'ReportsGenerated'
}

export interface OptimizerEvent {
  type: OptimizerEventType;
  timestamp: number;
  payload?: any;
}

export type OptimizerEventListener = (event: OptimizerEvent) => void;
