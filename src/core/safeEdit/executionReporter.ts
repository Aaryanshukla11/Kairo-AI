import { SafeEditReport, SafeEditInput } from './safeEditTypes';

export class ExecutionReporter {
  public compileReport(
    input: SafeEditInput,
    riskScore: number,
    riskLevel: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical',
    approved: boolean,
    rollbackReady: boolean,
    blockingIssues: string[],
    warnings: string[]
  ): SafeEditReport {
    let status: 'Approved' | 'Approved With Warning' | 'Requires Approval' | 'Blocked' | 'Rejected' = 'Approved';

    const hasNonApprovalBlocks = blockingIssues.some(issue => !issue.startsWith('APPROVAL-'));

    if (hasNonApprovalBlocks) {
      // Reject if critical issues exist (e.g. unsafe fs, dependencies, policy violations)
      status = 'Rejected';
    } else if (!approved) {
      status = 'Requires Approval';
    } else if (warnings.length > 0) {
      status = 'Approved With Warning';
    }

    let recommendation = 'Safe to proceed with executor agent patch write.';
    if (status === 'Rejected') {
      recommendation = 'Halt write operations. Immediate security, policy, or safety rejection.';
    } else if (status === 'Blocked') {
      recommendation = 'Execution blocked due to safety gate constraints.';
    } else if (status === 'Requires Approval') {
      recommendation = 'Awaiting explicit user approval before execution.';
    } else if (status === 'Approved With Warning') {
      recommendation = 'Safe to proceed, but review warnings before applying.';
    }

    // Base confidence starts at 0.95 and decays slightly if there are warnings or high risk
    let confidence = 0.98;
    if (riskLevel === 'Critical' || riskLevel === 'High') {
      confidence -= 0.08;
    }
    if (warnings.length > 0) {
      confidence -= 0.04;
    }
    confidence = Math.max(0.5, Math.min(1.0, confidence));

    return {
      executionStatus: status,
      riskScore,
      riskLevel,
      approvalStatus: approved,
      rollbackReadiness: rollbackReady,
      blockingIssues,
      warnings,
      executionRecommendation: recommendation,
      confidence
    };
  }
}

export const executionReporter = new ExecutionReporter();
