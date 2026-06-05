import { PermissionAction, PermissionPolicy } from './permissionTypes';

export interface SavedPolicyRule {
  action: PermissionAction;
  resourcePattern: string;
  policy: PermissionPolicy;
  approved: boolean;
  expiresAt?: number;
}

export class PermissionPolicyManager {
  private rules: SavedPolicyRule[] = [];

  /**
   * Registers or updates a policy rule cache.
   */
  public addRule(action: PermissionAction, resourcePattern: string, policy: PermissionPolicy, approved: boolean, ttlMs?: number): void {
    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
    this.rules = this.rules.filter(r => !(r.action === action && r.resourcePattern === resourcePattern));
    this.rules.push({ action, resourcePattern, policy, approved, expiresAt });
  }

  /**
   * Matches incoming actions against active rules, identifying hits and approvals.
   */
  public checkPolicy(action: PermissionAction, resource: string): { matches: boolean; policy?: PermissionPolicy; approved?: boolean } {
    const now = Date.now();
    this.rules = this.rules.filter(r => !r.expiresAt || r.expiresAt > now);

    const match = this.rules.find(r => {
      if (r.action !== action) return false;
      if (r.resourcePattern === '*' || r.resourcePattern === resource) return true;
      if (resource.startsWith(r.resourcePattern)) return true;
      return false;
    });

    if (match) {
      if (match.policy === PermissionPolicy.AlwaysDeny) {
        return { matches: true, policy: PermissionPolicy.AlwaysDeny, approved: false };
      }
      if (match.policy === PermissionPolicy.AlwaysAllow) {
        return { matches: true, policy: PermissionPolicy.AlwaysAllow, approved: true };
      }
      if (match.policy === PermissionPolicy.AllowForSession) {
        return { matches: true, policy: PermissionPolicy.AllowForSession, approved: match.approved };
      }
      if (match.policy === PermissionPolicy.AskOnce) {
        return { matches: true, policy: PermissionPolicy.AskOnce, approved: match.approved };
      }
    }

    return { matches: false };
  }

  public clearSessionRules(): void {
    this.rules = this.rules.filter(r => r.policy !== PermissionPolicy.AllowForSession);
  }

  public getRules(): SavedPolicyRule[] {
    return [...this.rules];
  }
}
