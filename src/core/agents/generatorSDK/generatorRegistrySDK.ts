import { BaseSDKGenerator } from './baseGeneratorSDK';
import { ConfigGenerator, SharedUtilGenerator, BackendGenerator, UIComponentGenerator } from './defaultGenerators';
import { DatabaseGeneratorSDK } from './database/databaseGeneratorSDK';
import { AuthGeneratorSDK } from './auth/authGeneratorSDK';
import { ApiGeneratorSDK } from './api/apiGeneratorSDK';
import { DocumentationGeneratorSDK } from './documentation/documentationGeneratorSDK';
import { TestingGeneratorSDK } from './testing/testingGeneratorSDK';

export class GeneratorRegistrySDK {
  private generators = new Map<string, BaseSDKGenerator>();

  constructor() {
    this.register(new ConfigGenerator());
    this.register(new SharedUtilGenerator());
    this.register(new BackendGenerator());
    this.register(new UIComponentGenerator());
    this.register(new DatabaseGeneratorSDK());
    this.register(new AuthGeneratorSDK());
    this.register(new ApiGeneratorSDK());
    this.register(new DocumentationGeneratorSDK());
    this.register(new TestingGeneratorSDK());
  }

  public register(generator: BaseSDKGenerator): void {
    if (!generator || !generator.id) {
      throw new Error('[GeneratorRegistrySDK] Cannot register generator without a valid ID.');
    }
    this.generators.set(generator.id, generator);
  }

  public unregister(id: string): void {
    this.generators.delete(id);
  }

  public resolve(id: string): BaseSDKGenerator | undefined {
    if (!id) return undefined;
    if (this.generators.has(id)) return this.generators.get(id);

    const lower = id.toLowerCase();
    for (const [key, gen] of this.generators.entries()) {
      if (key.toLowerCase() === lower || gen.id.toLowerCase() === lower) {
        return gen;
      }
    }

    const aliasMap: Record<string, string> = {
      'frontend-generator': 'UIComponentGenerator',
      'ui-generator': 'UIComponentGenerator',
      'uicomponentgenerator': 'UIComponentGenerator',
      'backend-generator': 'BackendGenerator',
      'backendgenerator': 'BackendGenerator',
      'config-generator': 'ConfigGenerator',
      'configgenerator': 'ConfigGenerator',
      'configgeneratorsdk': 'ConfigGenerator',
      'sharedutilgenerator': 'SharedUtilGenerator',
      'database-generator': 'database-generator',
      'auth-generator': 'auth-generator',
      'api-generator': 'api-generator',
      'documentation-generator': 'documentation-generator',
      'testing-generator': 'testing-generator'
    };

    const mappedId = aliasMap[lower];
    if (mappedId && this.generators.has(mappedId)) {
      return this.generators.get(mappedId);
    }

    for (const gen of this.generators.values()) {
      if (gen.capabilities.some(c => c.toLowerCase() === lower || lower.includes(c.toLowerCase()))) {
        return gen;
      }
    }

    // Safe fallback to UIComponentGenerator or first registered generator
    return this.generators.get('UIComponentGenerator') || this.generators.values().next().value;
  }

  public list(): readonly BaseSDKGenerator[] {
    return Object.freeze(Array.from(this.generators.values()));
  }

  public has(id: string): boolean {
    return this.generators.has(id);
  }
}

export const globalGeneratorRegistrySDK = new GeneratorRegistrySDK();
