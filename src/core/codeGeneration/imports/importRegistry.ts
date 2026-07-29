export interface ImportProvider {
  name: string;
  isCorePackage(pkg: string): boolean;
}

export class ImportRegistry {
  private providers = new Map<string, ImportProvider>();

  public register(provider: ImportProvider): void {
    this.providers.set(provider.name, provider);
  }

  public getProviders(): ImportProvider[] {
    return Array.from(this.providers.values());
  }
}

export const importRegistry = new ImportRegistry();
