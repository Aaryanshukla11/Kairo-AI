import { planningContractValidator } from './validator';
import { IPlanningContract } from './types';

export class PlanningContractBuilder {
  public createContract(contract: IPlanningContract): IPlanningContract {
    const { valid, errors, warnings } = planningContractValidator.validate(contract);
    
    // Merge validation errors/warnings lists
    const finalContract: IPlanningContract = {
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

export const planningContractBuilder = new PlanningContractBuilder();
export default planningContractBuilder;
export * from './types';
export { PlanningContractValidator } from './validator';
