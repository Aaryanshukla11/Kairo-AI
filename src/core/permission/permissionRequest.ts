import { randomUUID } from 'crypto';
import { PermissionRequest, PermissionAction, PermissionRiskLevel, PermissionStatus } from './permissionTypes';

/**
 * Instantiates a standard PermissionRequest object shape.
 */
export function createPermissionRequest(
  action: PermissionAction,
  resource: string,
  riskLevel: PermissionRiskLevel,
  reason: string,
  requestedBy: string,
  operationId?: string
): PermissionRequest {
  return {
    id: randomUUID(),
    operationId,
    resource,
    action,
    riskLevel,
    reason,
    requestedBy,
    requestedAt: Date.now(),
    status: PermissionStatus.Pending
  };
}
