import { RuleProvider } from '../conventionRegistry';

export class NodeRules implements RuleProvider {
  public name = 'NodeModuleResolveRules';

  public checkRule(target: string): boolean {
    return target.includes('require') || target.includes('module.exports');
  }
}

export const nodeRules = new NodeRules();
