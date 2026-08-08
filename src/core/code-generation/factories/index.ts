import { IGenerator } from '../interfaces';

export class GeneratorFactory {
  private static registeredCreators = new Map<string, () => IGenerator>();

  public static registerCreator(type: string, creator: () => IGenerator): void {
    this.registeredCreators.set(type, creator);
  }

  public static createGenerator(type: string): IGenerator {
    const creator = this.registeredCreators.get(type);
    if (!creator) {
      throw new Error(`Factory Exception: Creator for generator type '${type}' is not registered.`);
    }
    return creator();
  }
}
