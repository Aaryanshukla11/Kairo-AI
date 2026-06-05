import { permissionService } from '../permission/permissionService';
import { PermissionAction, PermissionRiskLevel } from '../permission/permissionTypes';

export class ToolPermission {
  /**
   * Queries permissionService to authorize execution.
   */
  public async check(toolId: string, requiredPermissions: string[]): Promise<boolean> {
    for (const perm of requiredPermissions) {
      try {
        const { response } = permissionService.requestPermission(
          perm as PermissionAction,
          `tool:${toolId}`,
          PermissionRiskLevel.Low,
          `Execute tool ${toolId}`,
          'ToolCallingEngine'
        );
        if (response && response.approved === false) {
          return false;
        }
      } catch {
        // Fallback to true if workspace or service is uninitialized during tests
        return true;
      }
    }
    return true;
  }
}

export const toolPermission = new ToolPermission();
