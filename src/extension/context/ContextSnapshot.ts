import { ContextPriority } from './ContextPriority';

export interface ContextSnapshot {
  readonly workspaceName: string;
  readonly framework: string;
  readonly languages: string[];
  readonly currentFile: string | null;
  readonly selectedFiles: string[];
  readonly futureOpenEditors: string[];
  readonly futureTerminalState: string | null;
  readonly futureGitState: any | null;
  readonly priorities: Record<string, ContextPriority>;
  readonly metadata: any;
}
