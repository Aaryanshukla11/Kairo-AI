import { securityScanner } from './securityScanner';
import { securityRiskEngine } from './securityRiskEngine';
import { securityPolicy } from './securityPolicy';
import { securityMetrics } from './securityMetrics';
import { securityValidator } from './securityValidator';
import { SecurityEvents } from './securityEvents';
import { SecurityReport, SecurityEventType, SecurityPolicyDecision } from './securityTypes';

export class SecurityBrain {
  constructor(private events: SecurityEvents) {}

  public async scanPlanWorkflow(plan: any): Promise<SecurityReport> {
    securityValidator.validateScanRequest(plan);

    this.events.emit(SecurityEventType.SecurityScanStarted, { planId: plan.id });

    const issues = securityScanner.scanPlan(plan);
    for (const issue of issues) {
      this.events.emit(SecurityEventType.IssueDetected, { issue });
    }

    const { score, level } = securityRiskEngine.calculateOverallRisk(issues);

    const decision = securityPolicy.evaluate(level);
    if (decision === SecurityPolicyDecision.Block || decision === SecurityPolicyDecision.RequireApproval) {
      this.events.emit(SecurityEventType.PolicyViolation, { score, level, decision });
    }
    if (decision === SecurityPolicyDecision.RequireApproval) {
      this.events.emit(SecurityEventType.ApprovalRequired, { planId: plan.id });
    }

    const blockedActions: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (decision === SecurityPolicyDecision.Block) {
      blockedActions.push(`Blocked execution of plan "${plan.id}" due to Critical risk score (${score})`);
    }

    for (const issue of issues) {
      warnings.push(`[${issue.severity}] ${issue.title}: ${issue.description}`);
      
      if (issue.ruleId === 'SEC-001') {
        recommendations.push('Core deletions detected: Ensure backups exist before running code updates.');
      } else if (issue.ruleId === 'SEC-002') {
        recommendations.push('Terminal execution vulnerability: Restructure shell parameters to avoid injections.');
      } else if (issue.ruleId === 'SEC-003') {
        recommendations.push('Credential exposures found: Move secrets to env settings configurations.');
      }
    }

    if (issues.length === 0) {
      recommendations.push('Plan matches standard rules: Safe to dispatch execution.');
    }

    securityMetrics.recordScan(issues.length, decision);

    if (decision === SecurityPolicyDecision.Block) {
      this.events.emit(SecurityEventType.SecurityFailed, { score });
    } else {
      this.events.emit(SecurityEventType.SecurityPassed, { score });
    }

    return {
      securityId: `sec-scan-${Date.now()}`,
      overallRisk: level,
      riskScore: score,
      detectedIssues: issues,
      blockedActions,
      warnings,
      recommendations,
      policyResult: decision
    };
  }
}
