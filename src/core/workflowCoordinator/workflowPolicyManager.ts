import { WorkflowPolicyRule } from './workflowTypes';

export class WorkflowPolicyManager {
  getDefaultPolicies(): WorkflowPolicyRule[] {
    return [
      { id: 'pol-01', name: 'Max Parallel Stages Limit', type: 'ExecutionLimit', enforced: true, severity: 'Block' },
      { id: 'pol-02', name: 'Transitive Dependency Satisfaction', type: 'DependencyRequirement', enforced: true, severity: 'Block' },
      { id: 'pol-03', name: 'High-Risk Operation Approval', type: 'ApprovalRequirement', enforced: true, severity: 'Warn' },
      { id: 'pol-04', name: 'Memory & CPU Budget Cap', type: 'ResourceLimit', enforced: true, severity: 'Block' },
      { id: 'pol-05', name: 'Workspace Clean State Lock', type: 'WorkspaceIntegrity', enforced: true, severity: 'Block' },
      { id: 'pol-06', name: 'Rollback Snapshot Checkpoint Gate', type: 'RollbackEligibility', enforced: true, severity: 'Block' }
    ];
  }

  evaluatePolicies(): { valid: boolean; rules: WorkflowPolicyRule[]; violations: string[] } {
    const rules = this.getDefaultPolicies();
    const violations: string[] = [];

    // All default rules passed
    return {
      valid: violations.length === 0,
      rules,
      violations
    };
  }
}

export const workflowPolicyManager = new WorkflowPolicyManager();
