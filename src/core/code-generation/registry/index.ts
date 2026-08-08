import { IGenerator, IGeneratorRegistry, IGenerationContext } from '../interfaces';
import { GeneratorMetadata } from '../types';
import { RegistryError } from '../errors';

export class GeneratorRegistry implements IGeneratorRegistry {
  private generators = new Map<string, IGenerator>();

  public register(generator: IGenerator): void {
    if (!generator.id) {
      throw new RegistryError(
        'Generator ID is empty or invalid.',
        'GeneratorRegistry',
        'Ensure the generator defines a valid non-empty string id.'
      );
    }
    if (this.generators.has(generator.id)) {
      throw new RegistryError(
        `Duplicate registration: Generator with ID '${generator.id}' is already registered.`,
        'GeneratorRegistry',
        `Deduplicate ID bindings or unregister the existing generator first.`
      );
    }
    this.generators.set(generator.id, generator);
  }

  public unregister(id: string): void {
    if (!this.generators.has(id)) {
      throw new RegistryError(
        `Unregistration failed: Generator with ID '${id}' not found.`,
        'GeneratorRegistry',
        'Verify target generator ID string.'
      );
    }
    this.generators.delete(id);
  }

  public resolve(id: string): IGenerator | undefined {
    return this.generators.get(id);
  }

  public async execute(id: string, context: IGenerationContext): Promise<IGenerationContext> {
    const gen = this.resolve(id);
    if (!gen) {
      throw new RegistryError(
        `Resolution failed: Generator with ID '${id}' is not registered.`,
        'GeneratorRegistry',
        `Register generator ${id} before execution.`
      );
    }
    return gen.execute(context);
  }

  public list(): IGenerator[] {
    return Array.from(this.generators.values());
  }

  public metadata(id: string): GeneratorMetadata | undefined {
    const gen = this.resolve(id);
    if (!gen) return undefined;
    return {
      id: gen.id,
      name: gen.name,
      version: gen.version,
      description: gen.description,
      supportedLanguages: gen.supportedLanguages,
      supportedFrameworks: gen.supportedFrameworks,
      supportedProjectTypes: gen.supportedProjectTypes,
      priority: gen.priority,
      dependencies: gen.dependencies
    };
  }

  public version(id: string): string | undefined {
    return this.resolve(id)?.version;
  }

  public capabilities(id: string): string[] {
    const meta = this.metadata(id);
    if (!meta) return [];
    return [
      ...meta.supportedLanguages,
      ...meta.supportedFrameworks,
      ...meta.supportedProjectTypes
    ];
  }

  public priority(id: string): number | undefined {
    return this.resolve(id)?.priority;
  }

  public dependencies(id: string): string[] {
    return this.resolve(id)?.dependencies || [];
  }
}

export const generatorRegistry = new GeneratorRegistry();
export default generatorRegistry;
