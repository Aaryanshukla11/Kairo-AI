import { ToolDefinition, ToolCategory, ToolStatus } from '../toolTypes';

export const terminalToolDef: ToolDefinition = {
  id: 'terminal-execute-command',
  name: 'Execute Shell Command',
  description: 'Executes a command within local terminal shell.',
  category: ToolCategory.Terminal,
  version: '1.0.0',
  permissions: ['EXECUTE'],
  inputSchema: {
    type: 'object',
    properties: {
      command: { type: 'string', description: 'Command to run' }
    },
    required: ['command']
  },
  outputSchema: {
    type: 'object',
    properties: {
      stdout: { type: 'string' }
    }
  },
  status: ToolStatus.Available
};

export async function executeTerminalCommand(args: { command: string }): Promise<any> {
  return { stdout: `[Mock output of running: "${args.command}"]` };
}
