import { ToolDefinition, ToolStatus } from './toolTypes';
import { filesystemToolDef, terminalToolDef, gitToolDef, workspaceToolDef, diagnosticsToolDef } from './adapters';

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  constructor() {
    this.register(filesystemToolDef);
    this.register(terminalToolDef);
    this.register(gitToolDef);
    this.register(workspaceToolDef);
    this.register(diagnosticsToolDef);
  }

  public register(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  public get(toolId: string): ToolDefinition | null {
    return this.tools.get(toolId) || null;
  }

  public list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public disable(toolId: string): void {
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.status = ToolStatus.Disabled;
    }
  }

  public enable(toolId: string): void {
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.status = ToolStatus.Available;
    }
  }
}

export const toolRegistry = new ToolRegistry();
