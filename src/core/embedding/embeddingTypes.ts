export enum EmbeddingSourceType {
  File = 'File',
  Folder = 'Folder',
  Function = 'Function',
  Class = 'Class',
  Component = 'Component',
  Api = 'Api',
  Configuration = 'Configuration',
  Documentation = 'Documentation'
}

export enum EmbeddingStatus {
  Queued = 'Queued',
  Generating = 'Generating',
  Completed = 'Completed',
  Failed = 'Failed',
  Expired = 'Expired'
}

export interface EmbeddingObject {
  id: string;
  sourceId: string;
  sourceType: EmbeddingSourceType;
  vectorId: string;
  checksum: string;
  createdAt: number;
  updatedAt: number;
  provider: string;
  status: EmbeddingStatus;
  vector?: number[];
}

export enum EmbeddingEventType {
  EmbeddingQueued = 'EmbeddingQueued',
  EmbeddingStarted = 'EmbeddingStarted',
  EmbeddingGenerated = 'EmbeddingGenerated',
  EmbeddingExpired = 'EmbeddingExpired',
  EmbeddingFailed = 'EmbeddingFailed'
}

export interface EmbeddingEvent {
  type: EmbeddingEventType;
  sourceId: string;
  timestamp: number;
  payload?: any;
}

export type EmbeddingEventListener = (event: EmbeddingEvent) => void;
