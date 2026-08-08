import { IGenerator } from './types';

export class GeneratorRegistry {
  private generators: Map<string, IGenerator> = new Map();

  public register(generator: IGenerator): void {
    if (this.generators.has(generator.generatorId)) {
      throw new Error(`Generator with ID '${generator.generatorId}' is already registered.`);
    }
    this.generators.set(generator.generatorId, generator);
  }

  public getGeneratorForType(taskType: string): IGenerator | undefined {
    return Array.from(this.generators.values()).find(g =>
      g.supportedTaskTypes.includes(taskType)
    );
  }

  public getGenerator(generatorId: string): IGenerator | undefined {
    return this.generators.get(generatorId);
  }

  public getAllGeneratorIds(): string[] {
    return Array.from(this.generators.keys());
  }

  public clear(): void {
    this.generators.clear();
  }
}

export const generatorRegistry = new GeneratorRegistry();
export default generatorRegistry;
