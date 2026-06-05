import { ToolDefinition, ToolCategory, ToolStatus } from '../toolTypes';

export const gitToolDef: ToolDefinition = {
  id: 'git-status',
  name: 'Git Status',
  description: 'Shows active file changes and status details in git.',
  category: ToolCategory.Git,
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
      status: { type: 'string' }
    }
  },
  status: ToolStatus.Available
};

export async function executeGitStatus(): Promise<any> {
  return { status: 'On branch main. Workspace clean.' };
}
