export interface NamingProvider {
  name: string;
  isReserved(word: string): boolean;
}

export class NamingRegistry {
  private providers = new Map<string, NamingProvider>();

  public register(provider: NamingProvider): void {
    this.providers.set(provider.name, provider);
  }

  public getProviders(): NamingProvider[] {
    return Array.from(this.providers.values());
  }
}

export const namingRegistry = new NamingRegistry();
