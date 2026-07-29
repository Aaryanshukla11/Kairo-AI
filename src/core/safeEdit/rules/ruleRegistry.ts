import { SafeRule } from './ruleTypes';

export class RuleRegistry {
  private rules = new Map<string, SafeRule>();

  public register(rule: SafeRule): void {
    this.rules.set(rule.ruleId, rule);
  }

  public list(): SafeRule[] {
    return Array.from(this.rules.values());
  }

  public get(ruleId: string): SafeRule | undefined {
    return this.rules.get(ruleId);
  }
}
export const ruleRegistry = new RuleRegistry();
