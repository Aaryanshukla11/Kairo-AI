import { PermissionResponse, PermissionStatus, PermissionPolicy } from './permissionTypes';

/**
 * Instantiates a standard PermissionResponse payload wrapper.
 */
export function createPermissionResponse(
  requestId: string,
  approved: boolean,
  status: PermissionStatus,
  policyApplied?: PermissionPolicy
): PermissionResponse {
  return {
    requestId,
    approved,
    status,
    policyApplied,
    timestamp: Date.now()
  };
}
