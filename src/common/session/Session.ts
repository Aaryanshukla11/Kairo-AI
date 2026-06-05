import { SessionState } from './SessionState';
import { SessionMetadata } from './SessionMetadata';

export interface Session {
  readonly id: string;
  readonly title: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly status: SessionState;
  readonly workspaceId?: string;
  readonly messages: any[]; // Future prompt/message interfaces
  readonly metadata: SessionMetadata;
  readonly version: string;
}
