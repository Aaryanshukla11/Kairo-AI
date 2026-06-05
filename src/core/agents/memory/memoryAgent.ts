import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { MemoryBrain } from './memoryBrain';
import { MemoryEvents } from './memoryEvents';
import { memoryMetrics } from './memoryMetrics';
import { MemoryEventType } from './memoryTypes';

export class MemoryAgent extends BaseAgent {
  private events = new MemoryEvents();
  public brain: MemoryBrain;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new MemoryBrain(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    try {
      let result;
      if (action === 'CREATE') {
        result = this.brain.createMemory(task.payload.memory);
      } else if (action === 'SEARCH') {
        result = this.brain.search(task.payload.filter || {});
      } else if (action === 'UPDATE') {
        result = this.brain.updateMemory(task.payload.id, task.payload.updates);
      } else if (action === 'DELETE') {
        this.brain.deleteMemory(task.payload.id);
        result = { success: true };
      } else if (action === 'COMPRESS') {
        this.brain.compress();
        result = { success: true };
      } else if (action === 'GET_ALL') {
        result = this.brain.getAll();
      } else {
        throw new Error(`MemoryAgent error: Unknown action "${action}"`);
      }

      this.status = AgentStatus.Completed;
      return {
        success: true,
        result,
        metrics: memoryMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(MemoryEventType.MemoryDeleted, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
