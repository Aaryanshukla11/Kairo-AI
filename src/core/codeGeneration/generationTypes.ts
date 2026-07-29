export enum GenerationStrategy {
  CreateNewFeature = 'Create New Feature',
  ModifyExistingCode = 'Modify Existing Code',
  Scaffold = 'Scaffold',
  Refactor = 'Refactor',
  Boilerplate = 'Boilerplate',
  Configuration = 'Configuration',
  DocumentationStub = 'Documentation Stub'
}

export interface GeneratedSymbol {
  name: string;
  type: 'class' | 'interface' | 'function' | 'variable';
}

export interface GeneratedFile {
  path: string;
  content: string;
  symbols: GeneratedSymbol[];
}

export interface GenerationArtifact {
  generationId: string;
  files: GeneratedFile[];
  strategyUsed: GenerationStrategy;
  summary: string;
  warnings: string[];
  metrics: {
    durationMs: number;
    linesCount: number;
    filesCount: number;
  };
}

export interface GenerationContext {
  planId: string;
  targetPath: string;
  language: 'typescript' | 'javascript';
  projectConventions: string[];
}

export enum GenEventType {
  GenerationStarted = 'GenerationStarted',
  ContextPrepared = 'ContextPrepared',
  ArtifactGenerated = 'ArtifactGenerated',
  ValidationCompleted = 'ValidationCompleted',
  GenerationCompleted = 'GenerationCompleted',
  GenerationFailed = 'GenerationFailed'
}

export interface GenEvent {
  type: GenEventType;
  timestamp: number;
  payload?: any;
}

export type GenEventListener = (event: GenEvent) => void;
