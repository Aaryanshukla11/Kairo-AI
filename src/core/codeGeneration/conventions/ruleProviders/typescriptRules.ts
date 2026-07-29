import { RuleProvider } from '../conventionRegistry';

export class TypeScriptRules implements RuleProvider {
  public name = 'TypeScriptStyleRules';

  public checkRule(target: string): boolean {
    return target.endsWith('.ts') || target.endsWith('.tsx');
  }
}

export const typescriptRules = new TypeScriptRules();
