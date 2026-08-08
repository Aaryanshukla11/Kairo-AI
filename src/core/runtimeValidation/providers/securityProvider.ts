import { IRuntimeValidationProvider, RuntimeValidationContext, RuntimeValidationResult } from '../runtimeTypes';
import { securityAuditor } from '../security/securityAuditor';
import * as path from 'path';

export class SecurityProvider implements IRuntimeValidationProvider {
  public readonly id = 'security-provider-wrap';
  public readonly name = 'Security Audit Provider';
  public readonly targetSubsystem = 'Security';

  public async validate(context: RuntimeValidationContext): Promise<RuntimeValidationResult> {
    const workspaceRoot = path.resolve(__dirname, '../../../../');
    const audit = await securityAuditor.performAudit(workspaceRoot);
    const score = audit.violations.length === 0 ? 100 : Math.max(0, 100 - audit.violations.length * 15);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Completed filesystem, workspace isolation, sandbox containment and permission validation audits. Found ${audit.violations.length} warnings.`,
      errors: audit.violations,
      warnings: [],
      metrics: {
        securityViolationsCount: audit.violations.length,
        sandboxVerified: audit.sandboxEnforced ? 1 : 0
      }
    };
  }
}

export const securityProvider = new SecurityProvider();
export default securityProvider;
