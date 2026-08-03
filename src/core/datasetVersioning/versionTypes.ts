import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import { CollectorManifestModel } from '../datasetCollector/collectorTypes';

export interface DatasetVersionModel {
  datasetId: string;
  version: string;             // semantic version e.g. 1.0.0
  parentVersion?: string;
  creationTime: number;
  pipelineVersion: string;
  builderVersion: string;
  checksum: string;
  sampleCount: number;
  tokenEstimate: number;
  languages: string[];
  licenses: string[];
  qualityMetrics: {
    averageQualityScore: number;
    syntaxValidity: number;
    metadataCompleteness: number;
  };
}

export interface DatasetSnapshotModel {
  snapshotId: string;
  datasetId: string;
  version: string;
  timestamp: number;
  samples: CleanedSample[];
  checksum: string;
}

export interface LineageNode {
  version: string;
  parentVersion?: string;
  children: string[];
  derivedFrom?: string;
  pipelineStages: string[];
  transformationHistory: string[];
  experimentReferences: string[];
}

export interface VersionManifestModel {
  manifestId: string;
  datasetId: string;
  version: string;
  creationTime: number;
  checksum: string;
  sampleCount: number;
  tokenEstimate: number;
  collectorManifest?: CollectorManifestModel;
  checksumsMap: Record<string, string>; // filePath to SHA-256
}

export interface VersionComparisonModel {
  v1: string;
  v2: string;
  sampleCountDiff: number;
  tokenCountDiff: number;
  languagesAdded: string[];
  languagesRemoved: string[];
  qualityScoreDiff: number;
  duplicatesRemovedDiff: number;
  cleaningRulesDiff: string[];
  checksumsMatch: boolean;
}

export enum VersionEventType {
  VersionCreated = 'VersionCreated',
  SnapshotGenerated = 'SnapshotGenerated',
  ManifestCreated = 'ManifestCreated',
  RegistryUpdated = 'RegistryUpdated',
  LineageValidated = 'LineageValidated',
  ReportPublished = 'ReportPublished'
}

export interface VersionEvent {
  type: VersionEventType;
  timestamp: number;
  payload?: any;
}

export type VersionEventListener = (event: VersionEvent) => void;
