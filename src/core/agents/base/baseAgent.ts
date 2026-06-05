import { AgentDefinition, AgentStatus, AgentTask } from '../agentTypes';

export abstract class BaseAgent {
  constructor(public readonly definition: AgentDefinition) {}

  public get id(): string {
    return this.definition.id;
  }

  public get status(): AgentStatus {
    return this.definition.status;
  }

  public set status(status: AgentStatus) {
    this.definition.status = status;
  }

  public abstract executeTask(task: AgentTask): Promise<any>;
}
