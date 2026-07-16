import { ContextSnapshot } from './ContextSnapshot';
import { ContextPriority } from './ContextPriority';
import { ContextCollector } from './ContextCollector';
import { ContextCompressor } from './ContextCompressor';
import { ContextValidator } from './ContextValidator';

export class ContextBuilder {
  private currentContext: ContextSnapshot | null = null;

  /**
   * Constructs the immutable Context Snapshot gathering data from the workspace and session.
   */
  public async buildContext(workspaceSnapshot: any, session: any): Promise<ContextSnapshot> {
    
    // 1. Collect
    const workspaceCtx = ContextCollector.collectWorkspaceContext();
    const editorCtx = ContextCollector.collectEditorContext();
    const configCtx = ContextCollector.collectConfigurationContext();
    const gitCtx = ContextCollector.collectGitContext();
    const terminalCtx = ContextCollector.collectTerminalContext();

    // 2. Draft Snapshot
    const snapshotDraft: ContextSnapshot = {
      workspaceName: workspaceSnapshot?.workspaceName || 'Unknown',
      framework: workspaceSnapshot?.framework || 'Unknown',
      languages: workspaceSnapshot?.languages || [],
      currentFile: editorCtx.currentFile,
      selectedFiles: editorCtx.selectedFiles || [],
      futureOpenEditors: [], // Placeholder for future Planner logic
      futureTerminalState: terminalCtx.status,
      futureGitState: gitCtx.status,
      priorities: {
        'workspace': ContextPriority.MEDIUM,
        'selection': ContextPriority.HIGH,
        'currentFile': ContextPriority.CRITICAL
      },
      metadata: {
        generatedAt: Date.now(),
        sourceFilesCount: workspaceSnapshot?.fileCount || 0,
        version: '1.0.0'
      }
    };

    // 3. Compress
    const compressedSnapshot = ContextCompressor.compress(snapshotDraft);

    // 4. Validate
    const validation = ContextValidator.validate(compressedSnapshot);
    if (!validation.valid) {
      throw new Error(`Context validation failed: ${validation.errors.join(', ')}`);
    }

    // 5. Commit
    this.currentContext = Object.freeze(compressedSnapshot);
    return this.currentContext;
  }

  public getCurrentContext(): ContextSnapshot | null {
    return this.currentContext;
  }
}
