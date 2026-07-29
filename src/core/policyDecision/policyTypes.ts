import { RiskGraphData } from '../safeEdit/riskGraph/riskTypes';
import { ExecutionContext } from '../safeEdit/executionContext/executionContextTypes';

export type PolicyDecisionType =
  | 'Allow'
  | 'Warn'
  | 'Approval Required'
  | 'Reject'
  | 'Block';

export interface PolicyDecisionInput {
  riskGraph: RiskGraphData;
  approval: boolean;
  workspaceContext: ExecutionContext;
  organizationPolicy?: string[];
  repositoryPolicy?: string[];
  securityPolicy?: string[];
  architecturePolicy?: string[];
}

export interface PolicyDecisionReport {
  decision: PolicyDecisionType;
  reason: string;
  violations: string[];
  warnings: string[];
  timestamp: number;
}
