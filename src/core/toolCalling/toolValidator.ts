import { ToolDefinition, ToolStatus } from './toolTypes';

export class ToolValidator {
  /**
   * Asserts parameters against registry definition schemas.
   */
  public validateExecution(tool: ToolDefinition, args: Record<string, any>): void {
    if (tool.status === ToolStatus.Disabled) {
      throw new Error(`Tool calling validation error: Tool "${tool.id}" is disabled`);
    }

    const required = tool.inputSchema.required || [];
    for (const key of required) {
      if (!(key in args)) {
        throw new Error(`Tool calling validation error: Missing required argument "${key}" for tool "${tool.id}"`);
      }
    }

    const properties = tool.inputSchema.properties || {};
    for (const [key, value] of Object.entries(args)) {
      const spec = properties[key];
      if (!spec) {
        throw new Error(`Tool calling validation error: Unknown argument "${key}" passed to tool "${tool.id}"`);
      }

      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (spec.type && spec.type !== actualType) {
        throw new Error(`Tool calling validation error: Type mismatch for argument "${key}" in tool "${tool.id}": Expected ${spec.type}, but got ${actualType}`);
      }
    }
  }
}

export const toolValidator = new ToolValidator();
