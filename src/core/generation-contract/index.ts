import { generationContractValidator } from './validator';
import { IGenerationContract } from './types';
import { logKairoStage } from '../../common/kairoLogger';

export class GenerationContractBuilder {
  public createContract(contract: IGenerationContract): IGenerationContract {
    const executionId = contract.metadata?.requestId || `contract-${Date.now()}`;
    const startTime = Date.now();
    logKairoStage('GenerationContractBuilder', 'ENTER', executionId, { operationsCount: contract.operations?.length || 0 });

    try {
      const { valid, errors, warnings } = generationContractValidator.validate(contract);

      const finalContract: IGenerationContract = {
        ...contract,
        errors: Object.freeze([...contract.errors, ...errors]),
        warnings: Object.freeze([...contract.warnings, ...warnings])
      };

      const duration = Date.now() - startTime;
      logKairoStage('GenerationContractBuilder', 'EXIT', executionId, { operationsCount: contract.operations?.length || 0 }, { valid, errorsCount: errors.length }, duration);
      return this.deepFreeze(finalContract);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logKairoStage('GenerationContractBuilder', 'ERROR', executionId, { operationsCount: contract.operations?.length || 0 }, null, duration, error);
      throw error;
    }
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
