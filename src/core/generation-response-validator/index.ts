import { responseValidator } from './validator';
import { IGenerationContract } from '../generation-contract/types';
import { IValidationResult } from './types';

export class GenerationResponseValidator {
  public validateContract(contract: IGenerationContract): IValidationResult {
    const report = responseValidator.validate(contract);
    
    const validatedContract = report.isValid 
      ? this.deepFreeze({ ...contract })
      : null;

    return this.deepFreeze({
      report,
      validatedContract
    });
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

export const generationResponseValidator = new GenerationResponseValidator();
export default generationResponseValidator;
export * from './types';
export { ResponseValidator } from './validator';
