import { AgentTask, AgentEventType } from './agentTypes';
import { AgentEvents } from './agentEvents';
import { agentRegistry } from './agentRegistry';
import { agentLifecycle } from './agentLifecycle';
import { agentScheduler } from './agentScheduler';

export class AgentRuntime {
  private events = new AgentEvents();

  /**
   * Subscribes a listener to Agent Runtime changes.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  // --- APIs ---

  public async loadAgent(id: string): Promise<void> {
    const agent = agentRegistry.get(id);
    if (!agent) throw new Error(`Agent runtime error: Agent "${id}" not found`);

    await agentLifecycle.load(agent);
    this.events.emit(AgentEventType.AgentStarted, id);
  }

  public async unloadAgent(id: string): Promise<void> {
    const agent = agentRegistry.get(id);
    if (!agent) throw new Error(`Agent runtime error: Agent "${id}" not found`);

    await agentLifecycle.unload(agent);
    this.events.emit(AgentEventType.AgentStopped, id);
  }

  /**
   * Routes tasks to the registered agents and registers timing stats.
   */
  public async dispatchTask(task: AgentTask): Promise<any> {
    this.events.emit(AgentEventType.AgentTaskAssigned, task.assignedAgentId, { task });

    const agent = agentRegistry.get(task.assignedAgentId);
    if (!agent) {
      this.events.emit(AgentEventType.AgentFailed, task.assignedAgentId, { error: 'Agent not found' });
      throw new Error(`Agent runtime error: Assigned agent "${task.assignedAgentId}" not found`);
    }

    try {
      const res = await agentScheduler.dispatchTask(agent, task);
      this.events.emit(AgentEventType.AgentTaskCompleted, task.assignedAgentId, { task, res });
      return res;
    } catch (err: any) {
      this.events.emit(AgentEventType.AgentFailed, task.assignedAgentId, { error: err.message });
      throw err;
    }
  }

  /**
   * Aggregates live monitor metrics for UI displays.
   */
  public getMonitorStats(): any[] {
    const list = agentRegistry.list();
    const metrics = agentScheduler.listMetrics();

    return list.map(a => {
      const metric = metrics.find(m => m.agentId === a.id) || {
        tasksAssigned: 0,
        tasksCompleted: 0,
        tasksFailed: 0,
        totalLatencyMs: 0,
        messagesSent: 0,
        messagesReceived: 0
      };

      return {
        id: a.id,
        name: a.definition.name,
        role: a.definition.role,
        status: a.status,
        executionTimeMs: metric.totalLatencyMs,
        messagesSent: metric.messagesSent,
        messagesReceived: metric.messagesReceived,
        capabilities: a.definition.capabilities
      };
    });
  }
}
export const agentRuntimeInstance = new AgentRuntime();
