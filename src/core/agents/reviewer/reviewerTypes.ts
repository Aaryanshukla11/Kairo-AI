import { ExecutionPlan } from '../planner/plannerTypes';

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export interface IStructuredRepairIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  filePath: string;
  issueType: 'MISSING_EXPORT' | 'INVALID_IMPORT' | 'SYNTAX_ERROR' | 'SCHEMA_VIOLATION';
  exactProblem: string;
  affectedSymbol: string;
  suggestedFix: string;
}

export interface ReviewReport {
  planId: string;
  overallScore: number;
  riskScore: number;
  maintainabilityScore: number;
  performanceScore: number;
  securityScore: number;
  riskLevel: RiskLevel;
  warnings: string[];
  recommendations: string[];
  suggestedImprovements: string[];
  decision?: 'PASS' | 'REPAIR_REQUIRED';
  structuredRepairIssues?: IStructuredRepairIssue[];
}

export enum ReviewerEventType {
  ReviewStarted = 'ReviewStarted',
  IssueDetected = 'IssueDetected',
  RecommendationGenerated = 'RecommendationGenerated',
  ReviewCompleted = 'ReviewCompleted',
  ReviewFailed = 'ReviewFailed'
}

export interface ReviewerEvent {
  type: ReviewerEventType;
  timestamp: number;
  payload?: any;
}

export type ReviewerEventListener = (event: ReviewerEvent) => void;
