export interface SymbolDefinition {
  name: string;
  kind: 'Class' | 'Interface' | 'Function' | 'Variable' | 'Method' | 'Namespace';
  visibility: 'public' | 'private' | 'protected';
  namespace: string;
}

export interface SymbolResolutionReport {
  resolvedSymbols: SymbolDefinition[];
  unresolvedSymbols: string[];
  referenceGraph: {
    nodes: string[];
    edges: { from: string; to: string }[];
  };
  namespaceInfo: string[];
  visibility: string;
  diagnostics: string[];
  confidence: number;
}

export enum SymbolEventType {
  ResolutionStarted = 'ResolutionStarted',
  CandidateFound = 'CandidateFound',
  NamespaceResolved = 'NamespaceResolved',
  ReferenceResolved = 'ReferenceResolved',
  SymbolValidated = 'SymbolValidated',
  ResolutionCompleted = 'ResolutionCompleted'
}

export interface SymbolEvent {
  type: SymbolEventType;
  timestamp: number;
  payload?: any;
}

export type SymbolEventListener = (event: SymbolEvent) => void;
