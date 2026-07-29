import { RuleProvider } from '../conventionRegistry';

export class JavaScriptRules implements RuleProvider {
  public name = 'JavaScriptStyleRules';

  public checkRule(target: string): boolean {
    return target.endsWith('.js') || target.endsWith('.jsx');
  }
}

export const javascriptRules = new JavaScriptRules();
