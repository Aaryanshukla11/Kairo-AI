import { ApprovalEngine } from './ApprovalEngine';
import { ApprovalRegistry } from './ApprovalRegistry';
import { ApprovalDecision, ApprovalAction } from '../../common/approval';
import { RiskLevel } from '../../common/planner/RiskLevel';

export class ApprovalDispatcher {
  private engine: ApprovalEngine;
  private registry: ApprovalRegistry;

  constructor() {
    this.engine = new ApprovalEngine();
    this.registry = ApprovalRegistry.getInstance();
  }

  public dispatchNewRequest(sessionId: string, planId: string, riskLevel: RiskLevel, actions: ApprovalAction[]): void {
    const request = this.engine.createRequest(sessionId, planId, riskLevel, actions);
    this.registry.register(request);

    // Future: Broadcast to webview via messageRouter
  }

  public processDecision(requestId: string, decision: ApprovalDecision): void {
    const request = this.registry.getRequest(requestId);
    if (!request) {
      throw new Error(`Cannot process decision for unknown request ID ${requestId}`);
    }

    const resolvedRequest = this.engine.evaluateDecision(request, decision);
    this.registry.updateRequest(resolvedRequest);

    // Future: Trigger ExecutionEngine if decision === APPROVE
  }
}
