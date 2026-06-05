export interface ValidationReport {
  validationId: string;
  overallStatus: 'Passed' | 'Passed With Warnings' | 'Needs Review' | 'Rejected' | 'Blocked';
  passedRules: string[];
  failedRules: string[];
  diagnostics: string[];
  blockingIssues: string[];
  warnings: string[];
  confidence: number;
  validationScore: number;
}

export enum ValidationEventType {
  ValidationStarted = 'ValidationStarted',
  RuleExecuted = 'RuleExecuted',
  DiagnosticGenerated = 'DiagnosticGenerated',
  ValidationCompleted = 'ValidationCompleted',
  ValidationApproved = 'ValidationApproved',
  ValidationRejected = 'ValidationRejected'
}

export interface ValidationEvent {
  type: ValidationEventType;
  timestamp: number;
  payload?: any;
}

export type ValidationEventListener = (event: ValidationEvent) => void;
