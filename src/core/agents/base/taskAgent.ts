import { BaseAgent } from './baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';

export class TaskAgent extends BaseAgent {
  /**
   * Executes task payloads and reports completion states.
   */
  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    await new Promise(resolve => setTimeout(resolve, 600));
    this.status = AgentStatus.Completed;
    return { success: true, result: `Mock execution by ${this.definition.name} completed successfully` };
  }
}
