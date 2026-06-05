import { RuleProvider } from '../conventionRegistry';

export class ReactRules implements RuleProvider {
  public name = 'ReactHooksRules';

  public checkRule(target: string): boolean {
    return target.includes('use') || target.endsWith('.tsx');
  }
}

export const reactRules = new ReactRules();
