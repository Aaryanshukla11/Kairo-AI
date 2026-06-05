
export type PrecisionMode = 'fp32' | 'fp16' | 'bf16' | 'automatic' | string;

export type LossScalingMode = 'static' | 'dynamic' | 'automatic' | 'framework';

export interface PrecisionPolicy {
  policyId: string;
  precisionMode: PrecisionMode;
  lossScalingMode: LossScalingMode;
  initialScale: number;
  minScale: number;
  maxScale: number;
  growthFactor?: number;
  backoffFactor?: number;
  hysteresis?: number;
}

export interface CompatibilityReport {
  isCompatible: boolean;
  precisionMode: PrecisionMode;
  deviceType: string;
  supportedPrecisions: string[];
  issues: string[];
  warnings: string[];
}

export interface LossScalingReport {
  mode: LossScalingMode;
  currentScale: number;
  consecutiveNormalSteps: number;
  consecutiveOverflowSteps: number;
  lastAdjustmentStep: number;
}

export interface OverflowReport {
  hasOverflow: boolean;
  overflowCount: number;
  underflowCount: number;
  hasUnderflow: boolean;
  persistentOverflow: boolean;
  lastOverflowStep?: number;
  layerIssues: Array<{ layerName: string; issueType: 'NaN' | 'Infinity' | 'Underflow' }>;
}

export interface PrecisionReport {
  reportId: string;
  sessionId: string;
  precisionMode: PrecisionMode;
  compatibilityReport: CompatibilityReport;
  lossScalingReport: LossScalingReport;
  overflowReport: OverflowReport;
  recommendations: string[];
  createdAt: number;
}

export interface PrecisionMetrics {
  currentPrecision: PrecisionMode;
  scalingFactor: number;
  overflowCount: number;
  underflowCount: number;
  precisionChangesCount: number;
  hardwareSupported: boolean;
  timeline: Array<{
    step: number;
    precision: PrecisionMode;
    scalingFactor: number;
    hasOverflow: boolean;
  }>;
}

export interface PrecisionManifest {
  manifestId: string;
  sessionId: string;
  checksum: string;
  createdAt: number;
}

export enum PrecisionEventType {
  ConfigReceived = 'ConfigReceived',
  HardwareValidated = 'HardwareValidated',
  PrecisionSelected = 'PrecisionSelected',
  LossScalingConfigured = 'LossScalingConfigured',
  ExecutionMonitored = 'ExecutionMonitored',
  OverflowDetected = 'OverflowDetected',
  PolicyAdjusted = 'PolicyAdjusted',
  ReportsPublished = 'ReportsPublished'
}

export interface PrecisionEvent {
  type: PrecisionEventType;
  timestamp: number;
  payload?: any;
}

export type PrecisionEventListener = (event: PrecisionEvent) => void;
