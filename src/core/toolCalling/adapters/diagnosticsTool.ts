import { ToolDefinition, ToolCategory, ToolStatus } from '../toolTypes';

export const diagnosticsToolDef: ToolDefinition = {
  id: 'diagnostics-read-logs',
  name: 'Read Diagnostics Logs',
  description: 'Gathers recent syntax warnings, validation errors, and execution metrics.',
  category: ToolCategory.Diagnostics,
  version: '1.0.0',
  permissions: ['READ'],
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  },
  outputSchema: {
    type: 'object',
    properties: {
      logs: { type: 'array' }
    }
  },
  status: ToolStatus.Available
};

export async function executeDiagnosticsRead(): Promise<any> {
  return { logs: ['Warning: Duplicate key index.json', 'Info: Embedding cache Hit rate: 100%'] };
}
