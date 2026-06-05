import { OptimizedPatchReport } from '../patchOptimization/optimizationTypes';
import { ValidationReport } from '../validation/validationTypes';
import { SecurityReport } from '../agents/security/securityTypes';
import { ArchitectureReport } from '../agents/architecture/architectureTypes';

import { ExecutionContext } from './executionContext/executionContextTypes';
import { RiskGraphData } from './riskGraph/riskTypes';
import { RollbackReadinessCertificate } from './rollback/rollbackTypes';
import { ApprovalDecision } from './approval/approvalTypes';
import { ExecutionConfidenceReport } from './confidence/confidenceTypes';
import { SimulationReport } from './simulation/simulationTypes';
import { PolicyDecisionReport } from '../policyDecision/policyTypes';
import { ExecutionAuditReport } from '../audit/auditTypes';
import { ExecutionTimelineReport } from '../executionStateMachine/stateTypes';

export interface PolicyReport {
  policyId: string;
  compliant: boolean;
  violations: string[];
  warnings: string[];
}

export interface PatchManifest {
  manifestId: string;
  files: {
    path: string;
    type: 'add' | 'modify' | 'delete';
    size?: number;
  }[];
  dependenciesChanged: string[];
  operationsCount: number;
}

export interface SafeEditInput {
  targetFile: string;
  patchContent: string;
  userApproved?: boolean;
  optimizedPatchReport?: OptimizedPatchReport;
  validationReport?: ValidationReport;
  securityReport?: SecurityReport;
  architectureReport?: ArchitectureReport;
  policyReport?: PolicyReport;
  patchManifest?: PatchManifest;
}

export interface SafeEditReport {
  executionStatus: 'Approved' | 'Approved With Warning' | 'Requires Approval' | 'Blocked' | 'Rejected';
  riskScore: number;
  riskLevel: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical';
  approvalStatus: boolean;
  rollbackReadiness: boolean;
  blockingIssues: string[];
  warnings: string[];
  executionRecommendation: string;
  confidence: number;
  // Enhancements
  executionContext?: ExecutionContext;
  riskGraph?: RiskGraphData;
  rollbackCertificate?: RollbackReadinessCertificate;
  approvalDecision?: ApprovalDecision;
  confidenceReport?: ExecutionConfidenceReport;
  simulationReport?: SimulationReport;
  policyDecisionReport?: PolicyDecisionReport;
  executionAuditReport?: ExecutionAuditReport;
  timelineReport?: ExecutionTimelineReport;
}

export enum SafeEditEventType {
  SafetyEvaluationStarted = 'SafetyEvaluationStarted',
  RiskCalculated = 'RiskCalculated',
  ApprovalVerified = 'ApprovalVerified',
  RollbackVerified = 'RollbackVerified',
  ExecutionApproved = 'ExecutionApproved',
  ExecutionBlocked = 'ExecutionBlocked'
}

export interface SafeEditEvent {
  type: SafeEditEventType;
  timestamp: number;
  payload?: any;
}

export type SafeEditEventListener = (event: SafeEditEvent) => void;
