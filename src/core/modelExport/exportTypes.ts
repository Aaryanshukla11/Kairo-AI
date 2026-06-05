export type ExportFormat =
  | 'gguf'
  | 'safetensors'
  | 'onnx'
  | 'huggingface'
  | 'pytorch';

export type QuantizationType =
  | 'none'
  | 'q4_0'
  | 'q4_k_m'
  | 'q5_k_m'
  | 'q8_0'
  | 'fp16'
  | 'bf16';

export interface ExportConfig {
  format: ExportFormat;
  quantization: QuantizationType;
  metadata?: Record<string, any>;
}

export interface CompatibilityMatrix {
  gguf: { supported: boolean; minRamGB: number; backend: string };
  safetensors: { supported: boolean; minRamGB: number; backend: string };
  onnx: { supported: boolean; minRamGB: number; backend: string };
  huggingface: { supported: boolean; minRamGB: number; backend: string };
  pytorch: { supported: boolean; minRamGB: number; backend: string };
}

export interface UnifiedModelArtifact {
  artifactId: string;
  modelId: string;
  version: string;
  parentModelId?: string;
  baseModelId: string;
  fineTuningMethod?: string;
  datasetVersion: string;
  tokenizerVersion: string;
  trainingConfigId: string;
  checkpointId: string;
  evaluationResults: Record<string, number>;
  exportFormat: ExportFormat;
  quantization: QuantizationType;
  manifestChecksum: string;
  artifactChecksum: string;
  compatibilityReport: CompatibilityMatrix;
  creationTimestamp: number;
  fileSize: number;
}

export interface ExportMetricModel {
  exportId: string;
  format: ExportFormat;
  quantization: QuantizationType;
  conversionTimeMs: number;
  packagingTimeMs: number;
  fileSize: number;
  cpuUsagePercent: number;
  ramUsageMB: number;
  success: boolean;
}

export interface ExportReport {
  reportId: string;
  exportId: string;
  format: ExportFormat;
  quantization: QuantizationType;
  status: 'completed' | 'failed';
  errors: string[];
  warnings: string[];
  artifact?: UnifiedModelArtifact;
  createdAt: number;
}

export interface ExportManifest {
  exportId: string;
  format: ExportFormat;
  quantization: QuantizationType;
  fileList: { filename: string; size: number; checksum: string }[];
  checksum: string; // sha256 checksum of export manifest
  timestamp: number;
}

export enum ExportEventType {
  ReceiveModel = 'ReceiveModel',
  ValidateModel = 'ValidateModel',
  GenerateManifest = 'GenerateManifest',
  PackageArtifacts = 'PackageArtifacts',
  GenerateChecksums = 'GenerateChecksums',
  ExportFormats = 'ExportFormats',
  VerifyIntegrity = 'VerifyIntegrity',
  RegisterExport = 'RegisterExport',
  GenerateReports = 'GenerateReports'
}

export interface ExportEvent {
  type: ExportEventType;
  timestamp: number;
  exportId: string;
  payload: any;
}

export type ExportEventListener = (event: ExportEvent) => void;
