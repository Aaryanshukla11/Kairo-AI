export enum RiskLevel {
  Info = 'Info',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum SecurityPolicyDecision {
  Allow = 'Allow',
  Warn = 'Warn',
  RequireApproval = 'Require Approval',
  Block = 'Block'
}

export interface SecurityIssue {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  severity: RiskLevel;
  location?: string;
}

export interface SecurityReport {
  securityId: string;
  overallRisk: RiskLevel;
  riskScore: number; // 0 - 100
  detectedIssues: SecurityIssue[];
  blockedActions: string[];
  warnings: string[];
  recommendations: string[];
  policyResult: SecurityPolicyDecision;
}

export enum SecurityEventType {
  SecurityScanStarted = 'SecurityScanStarted',
  IssueDetected = 'IssueDetected',
  PolicyViolation = 'PolicyViolation',
  ApprovalRequired = 'ApprovalRequired',
  SecurityPassed = 'SecurityPassed',
  SecurityFailed = 'SecurityFailed'
}

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  payload?: any;
}

export type SecurityEventListener = (event: SecurityEvent) => void;
