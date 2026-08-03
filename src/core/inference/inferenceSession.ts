import { PipelineSession, SessionState } from './inferenceTypes';

export class InferenceSessionManager {
  private sessions = new Map<string, PipelineSession>();

  public createSession(sessionId: string, modelId: string): PipelineSession {
    const session: PipelineSession = {
      sessionId,
      modelId,
      createdAt: Date.now(),
      state: SessionState.Created,
      history: []
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  public getSession(sessionId: string): PipelineSession | undefined {
    return this.sessions.get(sessionId);
  }

  public updateState(sessionId: string, state: SessionState, error?: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.state = state;
      if (error) session.error = error;
    }
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

export const inferenceSessionManager = new InferenceSessionManager();
