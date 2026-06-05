export interface ProvenanceModel {
  sampleId: string;
  datasetId: string;
  sourceType: 'local' | 'git' | 'archive' | 'markdown' | 'json' | 'documentation' | 'sourcecode' | string;
  repository?: string;
  repositoryUrl?: string;
  commitHash?: string;
  branch?: string;
  filePath: string;
  language: string;
  license: string;
  collectionTime: number;
  checksum: string;
  collectorVersion: string;
}

export interface CollectedFileItem {
  filePath: string;
  content: string;
  sizeBytes: number;
  provenance: ProvenanceModel;
  mimeType?: string;
  fileExtension?: string;
}

export interface CollectorManifestModel {
  manifestId: string;
  datasetId: string;
  collectionTime: number;
  totalFiles: number;
  totalBytes: number;
  licensesDistribution: Record<string, number>;
  languagesDistribution: Record<string, number>;
  sourceSummary?: Record<string, number>;
  checksums?: Record<string, string>;
  integrityStatus?: 'valid' | 'invalid';
  version?: string;
}

export interface CollectionStatisticsModel {
  activeSourcesCount: number;
  collectedFilesCount: number;
  totalBytes: number;
  licensesDistribution: Record<string, number>;
  languagesDistribution?: Record<string, number>;
  sourceDistribution?: Record<string, number>;
  integrityStatus?: 'valid' | 'invalid';
  durationMs?: number;
}

export interface SourceInfo {
  path: string;
  type: string;
  isReachable: boolean;
  fileCount?: number;
  totalBytes?: number;
  error?: string;
}

export interface SourceReport {
  timestamp: number;
  totalSources: number;
  reachableSources: number;
  unreachableSources: number;
  sources: SourceInfo[];
}

export interface LicenseReport {
  timestamp: number;
  totalFiles: number;
  detectedLicenses: Record<string, number>;
  unknownCount: number;
  permissibleCount: number;
}

export interface IntegrityReport {
  timestamp: number;
  isValid: boolean;
  totalFilesChecked: number;
  errors: string[];
  unreadableFiles: string[];
  missingChecksums: string[];
  emptyFiles: string[];
}

export interface CollectionReport {
  datasetId: string;
  timestamp: number;
  sourceReport: SourceReport;
  licenseReport: LicenseReport;
  integrityReport: IntegrityReport;
  statistics: CollectionStatisticsModel;
  manifest: CollectorManifestModel;
}

export interface CollectionPolicy {
  maxFileSizeBytes?: number;
  allowedExtensions?: string[];
  ignoredExtensions?: string[];
  ignoredDirectories?: string[];
  allowedLicenses?: string[];
  requireLicense?: boolean;
  includeGitMetadata?: boolean;
}

export interface RawFileInput {
  path: string;
  content: string;
  language?: string;
  repository?: string;
  repositoryUrl?: string;
  commitHash?: string;
  branch?: string;
}

export enum CollectorEventType {
  SourceDiscovered = 'SourceDiscovered',
  SourceValidated = 'SourceValidated',
  FilesScanned = 'FilesScanned',
  MetadataExtracted = 'MetadataExtracted',
  LicenseDetected = 'LicenseDetected',
  ProvenanceGenerated = 'ProvenanceGenerated',
  IntegrityValidated = 'IntegrityValidated',
  ManifestCreated = 'ManifestCreated',
  ReportPublished = 'ReportPublished'
}

export interface CollectorEvent {
  type: CollectorEventType;
  timestamp: number;
  payload?: any;
}

export type CollectorEventListener = (event: CollectorEvent) => void;
