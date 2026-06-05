export interface ImportStatement {
  source: string;
  specifiers: string[];
  kind: 'named' | 'default' | 'namespace' | 'type-only' | 'dynamic';
}

export interface ImportResolutionReport {
  targetFile: string;
  resolvedImports: ImportStatement[];
  missingImports: string[];
  duplicateImports: string[];
  unusedImports: string[];
  aliasResolution: { alias: string; resolved: string }[];
  diagnostics: string[];
  confidence: number;
}

export enum ImportEventType {
  ImportAnalysisStarted = 'ImportAnalysisStarted',
  SymbolResolved = 'SymbolResolved',
  AliasResolved = 'AliasResolved',
  ImportOptimized = 'ImportOptimized',
  ImportValidated = 'ImportValidated',
  ImportResolutionCompleted = 'ImportResolutionCompleted'
}

export interface ImportEvent {
  type: ImportEventType;
  timestamp: number;
  payload?: any;
}

export type ImportEventListener = (event: ImportEvent) => void;
