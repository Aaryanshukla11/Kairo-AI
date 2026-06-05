import { ContextMetadata } from './ContextMetadata';
import { ContextSummary } from './ContextSummary';

export interface Context {
  readonly id: string;
  readonly sessionId: string;
  readonly workspaceSnapshot: any; // Mapped to WorkspaceSnapshot in the backend
  readonly currentFile: string | null;
  readonly selectedFiles: string[];
  readonly futureOpenEditors: string[];
  readonly futureTerminalState: string | null;
  readonly futureGitState: any | null;
  readonly metadata: ContextMetadata;
  readonly summary: ContextSummary;
}
