export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export type ErrorCode = 
  | 'GENERATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'DEPENDENCY_ERROR'
  | 'CONTEXT_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'REGISTRY_ERROR'
  | 'PIPELINE_ERROR';

export type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface GenerationConfig {
  generatorTimeoutMs: number;
  retryCount: number;
  validationMode: 'strict' | 'loose';
  loggingLevel: LogLevel;
  allowParallelExecution: boolean;
  memoryLimitMb: number;
  preferredLanguages: string[];
  preferredFrameworks: string[];
}

export interface GeneratorMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  supportedLanguages: string[];
  supportedFrameworks: string[];
  supportedProjectTypes: string[];
  priority: number;
  dependencies: string[];
}
