import { ToolResult } from './toolTypes';

export function createSuccessResult(toolId: string, result: any, latencyMs: number): ToolResult {
  return {
    toolId,
    success: true,
    result,
    latencyMs
  };
}

export function createErrorResult(toolId: string, error: string, latencyMs: number): ToolResult {
  return {
    toolId,
    success: false,
    error,
    latencyMs
  };
}
