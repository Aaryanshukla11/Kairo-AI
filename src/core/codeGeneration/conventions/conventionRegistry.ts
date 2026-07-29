export interface RuleProvider {
  name: string;
  checkRule(target: string): boolean;
}

export class ConventionRegistry {
  private providers = new Map<string, RuleProvider>();

  public register(provider: RuleProvider): void {
    this.providers.set(provider.name, provider);
  }

  public getProviders(): RuleProvider[] {
    return Array.from(this.providers.values());
  }
}

export const conventionRegistry = new ConventionRegistry();
