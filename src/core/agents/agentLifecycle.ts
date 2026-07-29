import { BaseAgent } from './base';
import { AgentStatus } from './agentTypes';

export class AgentLifecycle {
  /**
   * Simulates loading latency and sets state status.
   */
  public async load(agent: BaseAgent): Promise<void> {
    agent.status = AgentStatus.Preparing;
    await new Promise(resolve => setTimeout(resolve, 300));
    agent.status = AgentStatus.Idle;
  }

  public async unload(agent: BaseAgent): Promise<void> {
    agent.status = AgentStatus.Stopped;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export const agentLifecycle = new AgentLifecycle();
