import { Session } from './Session';
import { SessionState } from './SessionState';
import { SessionMetadata } from './SessionMetadata';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export class SessionFactory {
  public static createSession(
    title: string = 'New Conversation',
    workspaceId?: string,
    metadata: SessionMetadata = {}
  ): Session {
    const timestamp = Date.now();

    return Object.freeze({
      id: generateUUID(),
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: SessionState.CREATED,
      workspaceId,
      messages: [],
      metadata,
      version: '1.0.0'
    });
  }

  public static updateSession(session: Session, updates: Partial<Session>): Session {
    return Object.freeze({
      ...session,
      ...updates,
      updatedAt: Date.now()
    });
  }
}
