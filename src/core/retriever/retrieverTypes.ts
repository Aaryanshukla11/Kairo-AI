import { WorkspaceSymbol, FileDependency, IndexedFile } from '../indexer/indexTypes';

export enum RetrievalStrategyType {
  Semantic = 'Semantic',
  Keyword = 'Keyword',
  Structural = 'Structural',
  Metadata = 'Metadata',
  Hybrid = 'Hybrid'
}

export interface RetrievalRequest {
  prompt: string;
  currentFile?: string;
  cursorLine?: number;
  selectedCode?: string;
  filters?: Record<string, any>;
  strategy?: RetrievalStrategyType;
}

export interface RetrievalResultItem {
  id: string;
  type: 'File' | 'Symbol' | 'Dependency' | 'Config' | 'Doc';
  name: string;
  filePath: string;
  score: number;
  metadata?: any;
}

export interface RetrievedContext {
  files: IndexedFile[];
  symbols: WorkspaceSymbol[];
  dependencies: FileDependency[];
  configs: any[];
  documentation: string[];
  confidenceScore: number;
}

export enum RetrieverEventType {
  RetrievalRequested = 'RetrievalRequested',
  RetrievalStarted = 'RetrievalStarted',
  ResultsRanked = 'ResultsRanked',
  RetrievalCompleted = 'RetrievalCompleted',
  RetrievalFailed = 'RetrievalFailed'
}

export interface RetrieverEvent {
  type: RetrieverEventType;
  prompt: string;
  timestamp: number;
  payload?: any;
}

export type RetrieverEventListener = (event: RetrieverEvent) => void;
