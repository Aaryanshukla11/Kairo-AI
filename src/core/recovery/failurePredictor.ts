import { FailureType } from './recoveryTypes';

export class FailurePredictor {
  predictRecurrenceRisk(failureType: FailureType): 'Low' | 'Medium' | 'High' {
    if (failureType === FailureType.Timeout || failureType === FailureType.ExecutionFailure) {
      return 'Low';
    }
    if (failureType === FailureType.DependencyFailure || failureType === FailureType.ResourceFailure) {
      return 'Medium';
    }
    return 'High';
  }
}

export const failurePredictor = new FailurePredictor();
