import { executeFilesystemRead, executeTerminalCommand, executeGitStatus, executeWorkspaceList, executeDiagnosticsRead } from './adapters';

export class ToolExecutor {
  /**
   * Routes tool IDs to their corresponding adapter function calls.
   */
  public async execute(toolId: string, args: Record<string, any>): Promise<any> {
    switch (toolId) {
      case 'filesystem-read-file':
        return executeFilesystemRead(args as any);
      case 'terminal-execute-command':
        return executeTerminalCommand(args as any);
      case 'git-status':
        return executeGitStatus();
      case 'workspace-list-files':
        return executeWorkspaceList(args as any);
      case 'diagnostics-read-logs':
        return executeDiagnosticsRead();
      default:
        throw new Error(`Tool executor error: No handler registered for tool: "${toolId}"`);
    }
  }
}

export const toolExecutor = new ToolExecutor();
