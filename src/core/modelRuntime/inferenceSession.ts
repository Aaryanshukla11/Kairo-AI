import { InferenceSession } from './runtimeTypes';

export class InferenceSessionManager {
  private sessions = new Map<string, InferenceSession>();

  public createSession(modelId: string, sessionId?: string): InferenceSession {
    const id = sessionId || `sess-${Date.now()}`;
    const session: InferenceSession = {
      sessionId: id,
      modelId,
      createdAt: Date.now(),
      history: [],
      status: 'active'
    };
    this.sessions.set(id, session);
    return session;
  }

  public getSession(sessionId: string): InferenceSession | null {
    return this.sessions.get(sessionId) || null;
  }

  public addMessage(sessionId: string, role: 'user' | 'assistant', content: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.history.push({ role, content });
    }
  }

  public closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'closed';
    }
  }

  public clearSessions(): void {
    this.sessions.clear();
  }
}

export const inferenceSessionManager = new InferenceSessionManager();
