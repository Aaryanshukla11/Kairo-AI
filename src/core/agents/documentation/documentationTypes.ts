export enum DocType {
  README = 'README',
  APIDocumentation = 'API Documentation',
  ArchitectureDocumentation = 'Architecture Documentation',
  DeveloperGuide = 'Developer Guide',
  UserGuide = 'User Guide',
  ReleaseNotes = 'Release Notes',
  MigrationGuide = 'Migration Guide',
  CodeComments = 'Code Comments'
}

export enum DocStrategy {
  IncrementalUpdate = 'Incremental Update',
  FullRegeneration = 'Full Regeneration',
  SectionUpdate = 'Section Update',
  TemplateBased = 'Template-based'
}

export interface DocPlan {
  planId: string;
  strategy: DocStrategy;
  affectedTypes: DocType[];
  impactDescription: string;
  filesToUpdate: string[];
}

export interface DocReport {
  updatedFiles: string[];
  generatedDocuments: { path: string; type: DocType }[];
  warnings: string[];
  coverage: number; // percentage 0-100
  suggestions: string[];
}

export enum DocEventType {
  DocumentationStarted = 'DocumentationStarted',
  DocumentGenerated = 'DocumentGenerated',
  DocumentUpdated = 'DocumentUpdated',
  ValidationPassed = 'ValidationPassed',
  DocumentationCompleted = 'DocumentationCompleted'
}

export interface DocEvent {
  type: DocEventType;
  timestamp: number;
  payload?: any;
}

export type DocEventListener = (event: DocEvent) => void;
