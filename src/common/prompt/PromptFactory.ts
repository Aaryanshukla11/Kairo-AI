import { Prompt } from './Prompt';
import { PromptMetadata } from './PromptMetadata';
import { MessageSource } from '../protocol/messageTypes';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export class PromptFactory {
  public static createPrompt(
    rawPrompt: string,
    source: MessageSource = MessageSource.WEBVIEW,
    workspaceId?: string,
    sessionId?: string,
    metadata: PromptMetadata = {}
  ): Prompt {
    const normalizedPrompt = rawPrompt.trim();

    return Object.freeze({
      id: generateId(),
      timestamp: Date.now(),
      rawPrompt,
      normalizedPrompt,
      source,
      workspaceId,
      sessionId,
      metadata,
    });
  }
}
