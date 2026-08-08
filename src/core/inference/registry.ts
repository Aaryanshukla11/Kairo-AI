import { ILocalInferenceProvider } from './types';
import { OllamaProvider } from './providers/ollamaProvider';

export class ProviderRegistry {
  private providers: Map<string, ILocalInferenceProvider> = new Map();

  constructor() {
    this.registerProvider(new OllamaProvider());
  }

  public registerProvider(provider: ILocalInferenceProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`Provider with name '${provider.name}' is already registered.`);
    }
    this.providers.set(provider.name, provider);
  }

  public removeProvider(name: string): void {
    this.providers.delete(name);
  }

  public getProvider(name: string): ILocalInferenceProvider | undefined {
    return this.providers.get(name);
  }

  public listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const providerRegistry = new ProviderRegistry();
export default providerRegistry;

