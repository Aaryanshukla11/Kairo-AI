import {
  RetryRecoveryStrategy,
  RollbackRecoveryStrategy,
  CheckpointRecoveryStrategy,
  WorkflowRecoveryStrategy,
  PartialRecoveryStrategy,
  ManualRecoveryStrategy
} from './strategies';

export class RecoveryStrategyRegistry {
  public retry = new RetryRecoveryStrategy();
  public rollback = new RollbackRecoveryStrategy();
  public checkpoint = new CheckpointRecoveryStrategy();
  public workflow = new WorkflowRecoveryStrategy();
  public partial = new PartialRecoveryStrategy();
  public manual = new ManualRecoveryStrategy();
}

export const recoveryStrategyRegistry = new RecoveryStrategyRegistry();
