import { ReplanStrategyType } from '../replanningTypes';

export class RecoveryReplanStrategy {
  replan(preservedTasks: string[], affectedTasks: string[]): { newExecutionOrder: string[]; strategy: ReplanStrategyType } {
    return {
      newExecutionOrder: [...preservedTasks, 'stg-recovery-checkpoint', ...affectedTasks],
      strategy: ReplanStrategyType.Recovery
    };
  }
}
