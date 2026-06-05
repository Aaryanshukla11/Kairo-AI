import { AgentTask, AgentStatus } from './agentTypes';
import { BaseAgent } from './base';

export interface AgentMetric {
  agentId: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksFailed: number;
  totalLatencyMs: number;
  messagesSent: number;
  messagesReceived: number;
}

export class AgentScheduler {
  private metrics = new Map<string, AgentMetric>();

  public getOrCreateMetric(agentId: string): AgentMetric {
    let metric = this.metrics.get(agentId);
    if (!metric) {
      metric = {
        agentId,
        tasksAssigned: 0,
        tasksCompleted: 0,
        tasksFailed: 0,
        totalLatencyMs: 0,
        messagesSent: 0,
        messagesReceived: 0
      };
      this.metrics.set(agentId, metric);
    }
    return metric;
  }

  /**
   * Dispatches task payload, updates state, and logs timing metrics.
   */
  public async dispatchTask(agent: BaseAgent, task: AgentTask): Promise<any> {
    console.log(`[TRACE] [AgentRuntime] ENTER: dispatchTask. Agent ID: ${agent.id}, Task ID: ${task.id}`);
    const start = Date.now();
    const metric = this.getOrCreateMetric(agent.id);
    metric.tasksAssigned++;
    metric.messagesReceived++;

    try {
      const res = await agent.executeTask(task);
      metric.tasksCompleted++;
      metric.totalLatencyMs += Date.now() - start;
      metric.messagesSent++;
      console.log(`[TRACE] [AgentRuntime] EXIT: dispatchTask completed. Agent ID: ${agent.id}, Task ID: ${task.id}`);
      return res;
    } catch (err: any) {
      metric.tasksFailed++;
      metric.totalLatencyMs += Date.now() - start;
      metric.messagesSent++;
      console.log(`[TRACE] [AgentRuntime] EXIT: dispatchTask failed. Agent ID: ${agent.id}, Task ID: ${task.id}, Error: ${err.message}`);
      throw err;
    }
  }

  public listMetrics(): AgentMetric[] {
    return Array.from(this.metrics.values());
  }

  public clear(): void {
    this.metrics.clear();
  }
}

export const agentScheduler = new AgentScheduler();
