import { ruleRegistry } from './ruleRegistry';
import { ruleLoader } from './ruleLoader';

export class RuleExecutor {
  constructor() {
    ruleLoader.loadDefaultRules();
  }

  public execute(patchContent: string, context: any): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const rules = ruleRegistry.list();

    for (const rule of rules) {
      if (!rule.enabled) continue;
      try {
        const result = rule.validate(patchContent, context);
        if (!result.valid) {
          const msg = `[${rule.ruleId}] ${rule.name}: ${result.error || 'Failed safety validation'}`;
          if (rule.severity === 'Critical' || rule.severity === 'High') {
            errors.push(msg);
          } else {
            warnings.push(msg);
          }
        }
      } catch (err: any) {
        errors.push(`Rule ${rule.ruleId} execution error: ${err.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
export const ruleExecutor = new RuleExecutor();
