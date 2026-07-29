export interface ExecutionAuditReport {
  auditId: string;
  decision: string;
  risk: any;
  simulation: any;
  validation: any;
  review: any;
  approval: any;
  patch: string;
  rollback: any;
  timingMs: number;
  agentChain: string[];
  timestamp: number;
}
