import { ContextItem, ContextPriority } from '../contextTypes';

export class WorkspaceProvider {
  public collect(workspaceFiles: string[]): ContextItem[] {
    return workspaceFiles.map((file, idx) => ({
      id: `work-${idx}`,
      source: 'workspace',
      content: `File contents of ${file}: mock contents for workspace intelligence parsing.`,
      tokenCount: 15,
      priority: ContextPriority.Medium,
      score: 0.5
    }));
  }
}
