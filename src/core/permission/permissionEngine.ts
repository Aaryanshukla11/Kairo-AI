import { createPermissionRequest } from './permissionRequest';
import { createPermissionResponse } from './permissionResponse';
import { PermissionRequest, PermissionResponse, PermissionAction, PermissionRiskLevel, PermissionStatus, PermissionPolicy, PermissionEventType } from './permissionTypes';
import { permissionValidator } from './permissionValidator';
import { PermissionRegistry } from './permissionRegistry';
import { PermissionPolicyManager } from './permissionPolicy';
import { PermissionEvents } from './permissionEvents';

export class PermissionEngine {
  private registry: PermissionRegistry;
  private policyManager = new PermissionPolicyManager();
  private events = new PermissionEvents();

  constructor(private workspaceRoot: string) {
    this.registry = new PermissionRegistry(workspaceRoot);
  }

  /**
   * Subscribes a listener to permission events.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  // --- API ---

  /**
   * Initiates permission request evaluation. If a rule fits, skips approval state.
   */
  public requestPermission(
    action: PermissionAction,
    resource: string,
    riskLevel: PermissionRiskLevel,
    reason: string,
    requestedBy: string,
    operationId?: string
  ): { request?: PermissionRequest; response?: PermissionResponse } {
    const check = this.policyManager.checkPolicy(action, resource);
    if (check.matches) {
      const approved = !!check.approved;
      const status = approved ? PermissionStatus.Approved : PermissionStatus.Denied;
      const response = createPermissionResponse('', approved, status, check.policy);
      return { response };
    }

    const request = createPermissionRequest(action, resource, riskLevel, reason, requestedBy, operationId);
    permissionValidator.validateRequest(request);

    this.registry.register(request);
    this.events.emit(PermissionEventType.PermissionRequested, request.id, { request });

    return { request };
  }

  /**
   * Updates request parameters on user grant actions.
   */
  public grantPermission(id: string, approved: boolean, policy?: PermissionPolicy): PermissionResponse {
    const req = this.registry.getById(id);
    if (!req) throw new Error(`Permission request not found: ${id}`);

    if (permissionValidator.isExpired(req)) {
      req.status = PermissionStatus.Expired;
      this.registry.updateStatus(id, PermissionStatus.Expired);
      this.events.emit(PermissionEventType.PermissionExpired, id);
      return createPermissionResponse(id, false, PermissionStatus.Expired);
    }

    const status = approved ? PermissionStatus.Approved : PermissionStatus.Denied;
    req.status = status;
    this.registry.updateStatus(id, status);

    if (policy && policy !== PermissionPolicy.AlwaysAsk) {
      this.policyManager.addRule(req.action, req.resource, policy, approved);
      req.policyUsed = policy;
    }

    const eventType = approved ? PermissionEventType.PermissionApproved : PermissionEventType.PermissionDenied;
    this.events.emit(eventType, id, { request: req });

    return createPermissionResponse(id, approved, status, policy);
  }

  /**
   * Iterates through pending requests to mark expired ones.
   */
  public expireRequests(): void {
    const history = this.registry.getHistory();
    for (const req of history) {
      if (req.status === PermissionStatus.Pending && permissionValidator.isExpired(req)) {
        req.status = PermissionStatus.Expired;
        this.registry.updateStatus(req.id, PermissionStatus.Expired);
        this.events.emit(PermissionEventType.PermissionExpired, req.id);
      }
    }
  }

  public getHistory(): PermissionRequest[] {
    return this.registry.getHistory();
  }

  public getRules(): any[] {
    return this.policyManager.getRules();
  }

  public clearSessionRules(): void {
    this.policyManager.clearSessionRules();
  }
}
