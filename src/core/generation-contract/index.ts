import { generationContractValidator } from './validator';
import { IGenerationContract } from './types';

export class GenerationContractBuilder {
  public createContract(contract: IGenerationContract): IGenerationContract {
    const { valid, errors, warnings } = generationContractValidator.validate(contract);

    const finalContract: IGenerationContract = {
      ...contract,
      errors: Object.freeze([...contract.errors, ...errors]),
      warnings: Object.freeze([...contract.warnings, ...warnings])
    };

    return this.deepFreeze(finalContract);
  }

  private deepFreeze<T>(obj: T): T {
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  }
}

export const generationContractBuilder = new GenerationContractBuilder();
export default generationContractBuilder;
export * from './types';
export { GenerationContractValidator } from './validator';
