export interface SymbolProvider {
  name: string;
  isReserved(symbol: string): boolean;
}

export class SymbolRegistry {
  private providers = new Map<string, SymbolProvider>();

  public register(provider: SymbolProvider): void {
    this.providers.set(provider.name, provider);
  }

  public getProviders(): SymbolProvider[] {
    return Array.from(this.providers.values());
  }
}

export const symbolRegistry = new SymbolRegistry();
