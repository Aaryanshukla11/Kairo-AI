import { ToolResult } from './toolTypes';

export interface ToolHistoryLog {
  id: string;
  toolId: string;
  args: any;
  success: boolean;
  latencyMs: number;
  timestamp: number;
}

export class ToolScheduler {
  private history: ToolHistoryLog[] = [];

  public logExecution(toolId: string, args: any, result: ToolResult): void {
    this.history.push({
      id: `exec-${Date.now()}-${Math.random()}`,
      toolId,
      args,
      success: result.success,
      latencyMs: result.latencyMs,
      timestamp: Date.now()
    });
  }

  public getHistory(): ToolHistoryLog[] {
    return this.history;
  }

  public clear(): void {
    this.history = [];
  }
}

export const toolScheduler = new ToolScheduler();
