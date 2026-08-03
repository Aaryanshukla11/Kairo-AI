import { FailureType, RecoveryStrategyType } from './recoveryTypes';

export class RecoveryAnalyzer {
  selectOptimalStrategy(failureType: FailureType, preferred?: RecoveryStrategyType): RecoveryStrategyType {
    if (preferred) return preferred;

    switch (failureType) {
      case FailureType.Timeout:
        return RecoveryStrategyType.Retry;
      case FailureType.WorkspaceFailure:
      case FailureType.ExecutionFailure:
        return RecoveryStrategyType.CheckpointRestore;
      case FailureType.PolicyFailure:
        return RecoveryStrategyType.ManualIntervention;
      case FailureType.DependencyFailure:
        return RecoveryStrategyType.WorkflowReconstruction;
      case FailureType.ValidationFailure:
      case FailureType.ResourceFailure:
      default:
        return RecoveryStrategyType.Rollback;
    }
  }
}

export const recoveryAnalyzer = new RecoveryAnalyzer();
