import { pipelineExecutor } from './executor';
import { IPlanningSession } from '../planning-session-builder/types';
import { IPlanningContract } from '../planning-contract/types';
import { IPlanningModelProvider, IExecutionConfig, IExecutionStats } from './types';

export class PlanningModelIntegration {
  private executionLogs: IExecutionStats[] = [];

  public async executeSession(
    session: IPlanningSession,
    provider: IPlanningModelProvider,
    config: IExecutionConfig = { maxRetries: 3, timeoutMs: 15000 }
  ): Promise<IPlanningContract> {
    return await pipelineExecutor.executePipeline(
      session,
      provider,
      config,
      (stats) => this.recordStats(stats)
    );
  }

  public getExecutionLogs(): readonly IExecutionStats[] {
    return Object.freeze([...this.executionLogs]);
  }

  private recordStats(stats: IExecutionStats): void {
    this.executionLogs.push(stats);
  }
}

export const planningModelIntegration = new PlanningModelIntegration();
export default planningModelIntegration;
export * from './types';
export { RetryExecutor } from './retry';
