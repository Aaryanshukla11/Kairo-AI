export interface DatasetManifestModel {
  datasetId: string;
  name: string;
  version: string;
  creationDate: number;
  source: string;
  languageDistribution: Record<string, number>;
  fileCount: number;
  tokenEstimate: number;
  license: string;
  checksum: string;
  tags: string[];
  description: string;
}

export interface DatasetFileItem {
  path: string;
  content: string;
  sizeBytes: number;
  tokenEstimate: number;
  language: string;
}

export interface DatasetModel {
  manifest: DatasetManifestModel;
  files: DatasetFileItem[];
  index: string[];
}

export interface DatasetValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DatasetStatisticsModel {
  totalBytes: number;
  totalTokens: number;
  averageFileSize: number;
  languageDistribution: Record<string, number>;
}

export enum DatasetBuilderEventType {
  SourcesDiscovered = 'SourcesDiscovered',
  FilesExtracted = 'FilesExtracted',
  ContentValidated = 'ContentValidated',
  MetadataGenerated = 'MetadataGenerated',
  DatasetBuilt = 'DatasetBuilt',
  ManifestGenerated = 'ManifestGenerated',
  DatasetVersioned = 'DatasetVersioned'
}

export interface DatasetBuilderEvent {
  type: DatasetBuilderEventType;
  timestamp: number;
  payload?: any;
}

export type DatasetBuilderEventListener = (event: DatasetBuilderEvent) => void;
