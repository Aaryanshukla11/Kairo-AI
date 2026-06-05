import { ToolDefinition } from '../toolTypes';

export interface ToolProvider {
  name: string;
  getTools(): ToolDefinition[];
  execute(toolId: string, args: Record<string, any>): Promise<any>;
}
