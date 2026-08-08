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
    return this.generators.get(id);
  }

  public list(): readonly BaseSDKGenerator[] {
    return Object.freeze(Array.from(this.generators.values()));
  }

  public has(id: string): boolean {
    return this.generators.has(id);
  }
}

export const globalGeneratorRegistrySDK = new GeneratorRegistrySDK();
