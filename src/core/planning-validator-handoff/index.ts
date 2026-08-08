import { planningContractValidatorCoordinator } from './validator';
import { handoffBuilder } from './handoff';
import { IPlanningContract } from '../planning-contract/types';
import { IHandoffResult } from './types';

export class PlanningValidatorHandoff {
  public validateAndHandoff(contract: IPlanningContract): IHandoffResult {
    const report = planningContractValidatorCoordinator.validateContract(contract);

    if (!report.isValid) {
      const failedResult: IHandoffResult = {
        status: 'FAILED',
        report,
        developmentRequest: null
      };
      return this.deepFreeze(failedResult);
    }

    const developmentRequest = handoffBuilder.compileHandoff(contract, report.warnings);

    const successResult: IHandoffResult = {
      status: 'SUCCESS',
      report,
      developmentRequest
    };

    return this.deepFreeze(successResult);
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

export const planningValidatorHandoff = new PlanningValidatorHandoff();
export default planningValidatorHandoff;
export * from './types';
export { SafetyValidator } from './safety';
export { PlanningContractValidatorCoordinator } from './validator';
export { HandoffBuilder } from './handoff';
