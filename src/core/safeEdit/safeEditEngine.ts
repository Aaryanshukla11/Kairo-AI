import { rollbackPlanner } from './rollbackPlanner';
import { executionReporter } from './executionReporter';
import { safeEditEvents } from './safeEditEvents';
import { safeEditMetrics } from './safeEditMetrics';
import { SafeEditReport, SafeEditEventType, SafeEditInput } from './safeEditTypes';

// Advanced safety additions
import { executionContextEngine } from './executionContext/executionContextEngine';
import { simulationEngine } from './simulation/simulationEngine';
import { riskGraph } from './riskGraph/riskGraph';
import { safetyProviderRegistry } from './providers';
import { ruleExecutor } from './rules/ruleExecutor';
import { approvalEngine } from './approval/approvalEngine';
import { confidenceEngine } from './confidence/confidenceEngine';
import { policyDecisionEngine } from '../policyDecision/policyDecisionEngine';
import { auditEngine } from '../audit/auditEngine';
import { executionStateMachine } from '../executionStateMachine/stateMachine';

export class SafeEditEngine {
  public async evaluate(
    targetFileOrInput: string | SafeEditInput,
    patchContent?: string,
    userApproved = true
  ): Promise<SafeEditReport> {
    const startTime = Date.now();
    executionStateMachine.reset();
    executionStateMachine.transitionTo('Created', 'Evaluation request initialized.');

    // 1. Load Patch
    let input: SafeEditInput;
    if (typeof targetFileOrInput === 'string') {
      input = {
        targetFile: targetFileOrInput,
        patchContent: patchContent || '',
        userApproved
      };
    } else {
      input = targetFileOrInput;
    }

    safeEditEvents.emit(SafeEditEventType.SafetyEvaluationStarted, { targetFile: input.targetFile });
    executionStateMachine.transitionTo('Planned', 'Patch manifest loaded.');

    // 2. Execution Context
    const executionContext = await executionContextEngine.getContext();

    // 3. Execution Simulation (Dry Run)
    const simulationReport = await simulationEngine.simulate(input.targetFile, input.patchContent);
    executionStateMachine.transitionTo('Simulated', 'Virtual workspace dry run completed.');

    // 4. Risk Graph
    const computedRiskGraph = riskGraph.compute(input);
    safeEditEvents.emit(SafeEditEventType.RiskCalculated, {
      riskScore: computedRiskGraph.overallRiskScore,
      riskLevel: computedRiskGraph.overallRiskLevel
    });

    // 5. Safety Providers
    const providerResults: any[] = [];
    const providers = safetyProviderRegistry.list();
    for (const prov of providers) {
      providerResults.push({
        name: prov.name,
        issues: prov.analyze(input),
        risk: prov.risk(input),
        recommendations: prov.recommendations(input)
      });
    }

    // 6. Safety Rules
    const ruleExecution = ruleExecutor.execute(input.patchContent, { targetFile: input.targetFile });
    executionStateMachine.transitionTo('Validated', 'Safety rules checks concluded.');

    // 7. Approval Engine
    const approvalDecision = approvalEngine.resolveApproval(
      input.validationReport ? 'Bug Fix' : 'Feature', // classifier fallback
      computedRiskGraph.overallRiskLevel,
      !!input.userApproved
    );
    safeEditEvents.emit(SafeEditEventType.ApprovalVerified, { approved: approvalDecision.granted });
    executionStateMachine.transitionTo('Reviewed', 'Approval policies verified.');

    // 8. Rollback Certificate
    const rollbackCertificate = rollbackPlanner.generateCertificate(input);
    safeEditEvents.emit(SafeEditEventType.RollbackVerified, { rollbackReady: rollbackCertificate.verificationResult === 'Success' });

    // 9. Confidence Engine
    const confidenceReport = confidenceEngine.calculate(input);

    // 10. Execution Decision Matrix (Policy Decision Engine)
    const policyDecisionReport = policyDecisionEngine.decide({
      riskGraph: computedRiskGraph,
      approval: approvalDecision.granted,
      workspaceContext: executionContext
    });

    if (policyDecisionReport.decision === 'Allow') {
      executionStateMachine.transitionTo('Approved', 'Passed policy decision gates.');
      executionStateMachine.transitionTo('Ready', 'Patches prepared for executor write.');
    } else {
      executionStateMachine.transitionTo('Failed', `Gate check rejected: ${policyDecisionReport.reason}`);
    }

    // 11. Safe Edit Report
    const baseReporterReport = executionReporter.compileReport(
      input,
      computedRiskGraph.overallRiskScore,
      computedRiskGraph.overallRiskLevel,
      approvalDecision.granted,
      rollbackCertificate.verificationResult === 'Success',
      [...ruleExecution.errors, ...policyDecisionReport.violations],
      [...ruleExecution.warnings, ...policyDecisionReport.warnings]
    );

    // Transition state machine outcome status
    if (baseReporterReport.executionStatus === 'Rejected') {
      safeEditEvents.emit(SafeEditEventType.ExecutionBlocked, { reason: baseReporterReport.blockingIssues.join(', ') });
    } else {
      safeEditEvents.emit(SafeEditEventType.ExecutionApproved, { targetFile: input.targetFile });
    }

    const timelineReport = executionStateMachine.getTimelineReport();

    // Log the execution audit trail
    const auditReport = auditEngine.logExecution({
      decision: policyDecisionReport.decision,
      risk: computedRiskGraph,
      simulation: simulationReport,
      validation: ruleExecution,
      review: { comments: baseReporterReport.warnings },
      approval: approvalDecision,
      patch: input.patchContent,
      rollback: rollbackCertificate,
      timingMs: Date.now() - startTime,
      agentChain: ['SafeEditEngine']
    });

    const report: SafeEditReport = {
      ...baseReporterReport,
      executionContext,
      riskGraph: computedRiskGraph,
      rollbackCertificate: rollbackCertificate as any,
      approvalDecision,
      confidenceReport,
      simulationReport,
      policyDecisionReport,
      executionAuditReport: auditReport,
      timelineReport
    };

    safeEditMetrics.record(baseReporterReport.blockingIssues.length > 0);

    return report;
  }

  public subscribe(listener: any): () => void {
    return safeEditEvents.subscribe(listener);
  }
}

export const safeEditEngine = new SafeEditEngine();
