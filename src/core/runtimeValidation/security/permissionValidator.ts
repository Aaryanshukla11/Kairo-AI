export class PermissionValidator {
  public validatePermissions(granted: string[], requested: string[]): { allowed: boolean; unauthorized: string[] } {
    const unauthorized = requested.filter(req => !granted.includes(req));
    return {
      allowed: unauthorized.length === 0,
      unauthorized
    };
  }
}

export const permissionValidator = new PermissionValidator();
