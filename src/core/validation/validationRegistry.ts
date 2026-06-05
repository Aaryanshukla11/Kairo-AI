export interface ValidationProvider {
  name: string;
  validateContent(content: string): string[];
}

export class ValidationRegistry {
  private providers = new Map<string, ValidationProvider>();

  public register(provider: ValidationProvider): void {
    this.providers.set(provider.name, provider);
  }

  public getProviders(): ValidationProvider[] {
    return Array.from(this.providers.values());
  }
}

export const validationRegistry = new ValidationRegistry();
