import { ToolDefinition, ToolCategory, ToolStatus } from '../toolTypes';

export const filesystemToolDef: ToolDefinition = {
  id: 'filesystem-read-file',
  name: 'Read Workspace File',
  description: 'Reads contents from a workspace file path.',
  category: ToolCategory.Filesystem,
  version: '1.0.0',
  permissions: ['READ'],
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Absolute path to file' }
    },
    required: ['path']
  },
  outputSchema: {
    type: 'object',
    properties: {
      content: { type: 'string' }
    }
  },
  status: ToolStatus.Available
};

export async function executeFilesystemRead(args: { path: string }): Promise<any> {
  return { content: `[Mock file content of: ${args.path}]` };
}
