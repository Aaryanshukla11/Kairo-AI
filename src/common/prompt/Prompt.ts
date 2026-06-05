import { PromptMetadata } from './PromptMetadata';
import { MessageSource } from '../protocol/messageTypes';

export interface Prompt {
  readonly id: string;
  readonly timestamp: number;
  readonly rawPrompt: string;
  readonly normalizedPrompt: string;
  readonly source: MessageSource;
  readonly workspaceId?: string;
  readonly sessionId?: string;
  readonly metadata: PromptMetadata;
}
