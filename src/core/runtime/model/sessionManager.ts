import { InferenceSession } from './runtimeTypes';

export class SessionManager {
  private sessions = new Map<string, InferenceSession>();

  public createSession(sessionId: string, modelId: string): InferenceSession {
    const session: InferenceSession = {
      sessionId,
      modelId,
      createdAt: Date.now(),
      history: []
    };
    this.sessions.set(sessionId, session);
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

  public clear(): void {
    this.sessions.clear();
  }
}

export const sessionManager = new SessionManager();
