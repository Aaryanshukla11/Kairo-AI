import { ErrorCode, ErrorSeverity } from '../types';

export abstract class BaseGenerationError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly module: string;
  public readonly timestamp: number;
  public readonly recoverySuggestion: string;

  constructor(
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity,
    module: string,
    recoverySuggestion: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.module = module;
    this.timestamp = Date.now();
    this.recoverySuggestion = recoverySuggestion;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GenerationError extends BaseGenerationError {
  constructor(message: string, module: string, recovery: string) {
    super(message, 'GENERATION_ERROR', 'ERROR', module, recovery);
  }
}

export class ValidationError extends BaseGenerationError {
  constructor(message: string, module: string, recovery: string) {
    super(message, 'VALIDATION_ERROR', 'ERROR', module, recovery);
  }
}

export class DependencyError extends BaseGenerationError {
  constructor(message: string, module: string, recovery: string) {
    super(message, 'DEPENDENCY_ERROR', 'CRITICAL', module, recovery);
  }
}

export class ContextError extends BaseGenerationError {
  constructor(message: string, module: string, recovery: string) {
    super(message, 'CONTEXT_ERROR', 'ERROR', module, recovery);
  }
}

export class ConfigurationError extends BaseGenerationError {
  constructor(message: string, module: string, recovery: string) {
    super(message, 'CONFIGURATION_ERROR', 'WARNING', module, recovery);
  }
}

export class RegistryError extends BaseGenerationError {
  constructor(message: string, module: string, recovery: string) {
    super(message, 'REGISTRY_ERROR', 'CRITICAL', module, recovery);
  }
}

export class PipelineError extends BaseGenerationError {
  constructor(message: string, module: string, recovery: string) {
    super(message, 'PIPELINE_ERROR', 'CRITICAL', module, recovery);
  }
}
