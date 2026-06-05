export class WorkspaceStateAnalyzer {
  public getActiveEditors(): string[] {
    return ['src/core/agents/architecture/architectureGraph.ts'];
  }
  public getLockedFiles(): string[] {
    return [];
  }
}
export const workspaceStateAnalyzer = new WorkspaceStateAnalyzer();
