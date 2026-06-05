import { ContextSnapshot } from './ContextSnapshot';

/**
 * Architectural stub for Context Collectors.
 * Future modules will expand these to interact with VS Code APIs.
 */
export class ContextCollector {
  public static collectWorkspaceContext(): any {
    return { status: 'mock_workspace_collected' };
  }

  public static collectEditorContext(): any {
    return { status: 'mock_editor_collected', currentFile: null, selectedFiles: [] };
  }

  public static collectSelectionContext(): any {
    return { status: 'mock_selection_collected' };
  }

  public static collectConfigurationContext(): any {
    return { status: 'mock_config_collected' };
  }

  public static collectGitContext(): any {
    return { status: 'mock_git_collected' };
  }

  public static collectTerminalContext(): any {
    return { status: 'mock_terminal_collected' };
  }
}
