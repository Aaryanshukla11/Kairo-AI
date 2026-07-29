export interface NamingReport {
  symbolName: string;
  alternativeNames: string[];
  confidenceScore: number;
  conventionMatch: boolean;
  collisionStatus: 'none' | 'warning' | 'error';
  namespace: string;
}

export enum NamingEventType {
  NamingStarted = 'NamingStarted',
  SemanticAnalyzed = 'SemanticAnalyzed',
  CandidateGenerated = 'CandidateGenerated',
  CollisionDetected = 'CollisionDetected',
  NameValidated = 'NameValidated',
  NamingCompleted = 'NamingCompleted'
}

export interface NamingEvent {
  type: NamingEventType;
  timestamp: number;
  payload?: any;
}

export type NamingEventListener = (event: NamingEvent) => void;
