export interface SessionState {
  sessionId: string;
  startTime: number;
  planId: string;
  status: 'active' | 'completed' | 'failed';
}

export class GenerationSessionManager {
  private sessions = new Map<string, SessionState>();

  public createSession(planId: string): string {
    const sessionId = `session-gen-${Date.now()}`;
    this.sessions.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      planId,
      status: 'active'
    });
    return sessionId;
  }

  public completeSession(sessionId: string, status: 'completed' | 'failed'): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
    }
  }

  public getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }
}

export const generationSessionManager = new GenerationSessionManager();
