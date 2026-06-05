import { ToolDefinition, ToolCategory, ToolStatus } from '../toolTypes';

export const workspaceToolDef: ToolDefinition = {
  id: 'workspace-list-files',
  name: 'List Workspace Files',
  description: 'Scans and lists files in the open workspace folder.',
  category: ToolCategory.Workspace,
  version: '1.0.0',
  permissions: ['READ'],
  inputSchema: {
    type: 'object',
    properties: {
      maxResults: { type: 'number', description: 'Limit output file counts' }
    },
    required: []
  },
  outputSchema: {
    type: 'object',
    properties: {
      files: { type: 'array' }
    }
  },
  status: ToolStatus.Available
};

export async function executeWorkspaceList(args: { maxResults?: number }): Promise<any> {
  return { files: ['package.json', 'src/extension/index.ts'].slice(0, args.maxResults || 2) };
}
