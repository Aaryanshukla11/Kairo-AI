import { PermissionRequest, PermissionAction } from './permissionTypes';

export class PermissionValidator {
  /**
   * Validates target properties and throws exceptions on invalid action names or missing resource targets.
   */
  public validateRequest(request: Partial<PermissionRequest>): void {
    if (!request.resource || !request.resource.trim()) {
      throw new Error('Permission validation error: Requested resource cannot be empty');
    }

    if (!request.action || !Object.values(PermissionAction).includes(request.action)) {
      throw new Error(`Permission validation error: Invalid or missing action type "${request.action}"`);
    }

    if (!request.riskLevel) {
      throw new Error('Permission validation error: Risk level is required');
    }

    if (!request.requestedBy || !request.requestedBy.trim()) {
      throw new Error('Permission validation error: Requesting module source must be specified');
    }
  }

  /**
   * Identifies expired request records.
   */
  public isExpired(request: PermissionRequest): boolean {
    const expiryWindow = 10 * 60 * 1000; // 10 minutes
    return Date.now() - request.requestedAt > expiryWindow;
  }
}

export const permissionValidator = new PermissionValidator();
