import { SafeRule } from './ruleTypes';

export class BaseSafeRule implements SafeRule {
  constructor(
    public ruleId: string,
    public name: string,
    public category: SafeRule['category'],
    public severity: SafeRule['severity'],
    public description: string,
    public supportedLanguages: string[],
    public supportedProviders: string[],
    public executionStage: SafeRule['executionStage'],
    public enabled = true
  ) {}

  public validate(patchContent: string, context: any): { valid: boolean; error?: string } {
    return { valid: true };
  }
}
