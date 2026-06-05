export interface TensorGradientModel {
  layerName: string;
  gradNorm: number;
  gradMean: number;
  gradVariance: number;
  gradDensity: number; // percentage of non-zero gradients
  values: number[]; // sample representation values
}

export interface GradientReportModel {
  reportId: string;
  sessionId: string;
  globalNorm: number;
  globalMean: number;
  globalVariance: number;
  layers: TensorGradientModel[];
  createdAt: number;
}

export interface AnomalyReportModel {
  hasAnomaly: boolean;
  nanDetected: boolean;
  infDetected: boolean;
  explodingGradients: boolean;
  vanishingGradients: boolean;
  sparseGradients: boolean;
  missingGradients: boolean;
  issues: string[];
}

export interface ClippingPolicyConfig {
  type: 'Norm' | 'Value' | 'Adaptive' | 'Policy-Based' | 'None';
  threshold: number;
}

export interface ValidationReportModel {
  isValid: boolean;
  errors: string[];
}

export interface GradientManifestModel {
  manifestId: string;
  sessionId: string;
  checksum: string;
  createdAt: number;
}

export enum GradientEventType {
  GradientsReceived = 'GradientsReceived',
  Validated = 'Validated',
  Aggregated = 'Aggregated',
  Inspected = 'Inspected',
  StatisticsGenerated = 'StatisticsGenerated',
  AnomaliesDetected = 'AnomaliesDetected',
  ReportsPublished = 'ReportsPublished',
  Clipped = 'Clipped'
}

export interface GradientEvent {
  type: GradientEventType;
  timestamp: number;
  payload?: any;
}

export type GradientEventListener = (event: GradientEvent) => void;
