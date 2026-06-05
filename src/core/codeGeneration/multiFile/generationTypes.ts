export interface FileOperation {
  filePath: string;
  operation: 'create' | 'modify' | 'rename' | 'move' | 'delete';
  dependencies: string[]; // target paths this file operation depends on
  originalPath?: string; // used for renames/moves
}

export interface MultiFilePlan {
  generationId: string;
  affectedFiles: string[];
  creationOrder: string[];
  dependencyOrder: string[];
  generatedArtifacts: { path: string; content: string; operation: string }[];
  validationSummary: {
    isValid: boolean;
    errors: string[];
  };
  warnings: string[];
  metrics: {
    filesCount: number;
    durationMs: number;
  };
}

export enum MultiFileEventType {
  GenerationPlanningStarted = 'GenerationPlanningStarted',
  FileDiscovered = 'FileDiscovered',
  DependencyResolved = 'DependencyResolved',
  ArtifactGenerated = 'ArtifactGenerated',
  ConsistencyValidated = 'ConsistencyValidated',
  GenerationCompleted = 'GenerationCompleted'
}

export interface MultiFileEvent {
  type: MultiFileEventType;
  timestamp: number;
  payload?: any;
}

export type MultiFileEventListener = (event: MultiFileEvent) => void;
