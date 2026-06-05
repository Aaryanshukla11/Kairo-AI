export abstract class BaseValidationError extends Error {
  public readonly code: string;
  public readonly module: string;
  public readonly severity: 'WARNING' | 'ERROR' | 'CRITICAL';
  public readonly recoverySuggestion: string;

  constructor(
    message: string,
    code: string,
    module: string,
    severity: 'WARNING' | 'ERROR' | 'CRITICAL',
    recovery: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.module = module;
    this.severity = severity;
    this.recoverySuggestion = recovery;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SchemaValidationError extends BaseValidationError {
  constructor(message: string, recovery: string) {
    super(message, 'SCHEMA_VALIDATION_ERROR', 'ERROR', 'RequirementSchema', recovery);
  }
}

export class CompatibilityError extends BaseValidationError {
  constructor(message: string, recovery: string) {
    super(message, 'COMPATIBILITY_ERROR', 'ERROR', 'RequirementCompatibility', recovery);
  }
}

export class MissingRequirementError extends BaseValidationError {
  constructor(message: string, recovery: string) {
    super(message, 'MISSING_REQUIREMENT_ERROR', 'ERROR', 'RequirementCompleteness', recovery);
  }
}

export class DependencyValidationError extends BaseValidationError {
  constructor(message: string, recovery: string) {
    super(message, 'DEPENDENCY_VALIDATION_ERROR', 'CRITICAL', 'RequirementDependency', recovery);
  }
}

export class ConflictError extends BaseValidationError {
  constructor(message: string, recovery: string) {
    super(message, 'CONFLICT_ERROR', 'CRITICAL', 'RequirementConflict', recovery);
  }
}

export class RiskValidationError extends BaseValidationError {
  constructor(message: string, recovery: string) {
    super(message, 'RISK_VALIDATION_ERROR', 'WARNING', 'RequirementRisk', recovery);
  }
}
