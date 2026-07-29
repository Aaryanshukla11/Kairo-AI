import { ToolResult, ToolCallingEventType } from './toolTypes';
import { ToolEvents } from './toolEvents';
import { toolRegistry } from './toolRegistry';
import { toolValidator } from './toolValidator';
import { toolPermission } from './toolPermission';
import { toolExecutor } from './toolExecutor';
import { toolScheduler } from './toolScheduler';
import { createSuccessResult, createErrorResult } from './toolResult';

export class ToolEngine {
  private events = new ToolEvents();

  /**
   * Subscribes a listener to Tool Calling changes.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  // --- APIs ---

  public async executeTool(toolId: string, args: Record<string, any>): Promise<ToolResult> {
    const start = Date.now();
    this.events.emit(ToolCallingEventType.ToolRequested, toolId);

    try {
      const tool = toolRegistry.get(toolId);
      if (!tool) {
        throw new Error(`Tool calling error: Tool "${toolId}" not found in registry`);
      }

      toolValidator.validateExecution(tool, args);

      const allowed = await toolPermission.check(toolId, tool.permissions);
      if (!allowed) {
        throw new Error(`Tool calling error: Permission Denied to execute tool: "${toolId}"`);
      }

      this.events.emit(ToolCallingEventType.ToolStarted, toolId);

      const rawResult = await toolExecutor.execute(toolId, args);
      const latencyMs = Date.now() - start;

      const result = createSuccessResult(toolId, rawResult, latencyMs);
      toolScheduler.logExecution(toolId, args, result);
      
      this.events.emit(ToolCallingEventType.ToolCompleted, toolId, { result });
      return result;
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      const result = createErrorResult(toolId, err.message, latencyMs);
      toolScheduler.logExecution(toolId, args, result);

      this.events.emit(ToolCallingEventType.ToolFailed, toolId, { error: err.message });
      return result;
    }
  }

  public getHistory(): any[] {
    return toolScheduler.getHistory();
  }
}
