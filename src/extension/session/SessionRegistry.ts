import { Session } from '../../common/session';

export class SessionRegistry {
  private sessions: Map<string, Session> = new Map();
  private currentSessionId: string | null = null;

  public addSession(session: Session): void {
    this.sessions.set(session.id, session);
  }

  public getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  public updateSession(session: Session): void {
    if (this.sessions.has(session.id)) {
      this.sessions.set(session.id, session);
    }
  }

  public deleteSession(id: string): boolean {
    if (this.currentSessionId === id) {
      this.currentSessionId = null;
    }
    return this.sessions.delete(id);
  }

  public setCurrentSessionId(id: string): void {
    if (this.sessions.has(id)) {
      this.currentSessionId = id;
    }
  }

  public getCurrentSession(): Session | undefined {
    if (!this.currentSessionId) return undefined;
    return this.sessions.get(this.currentSessionId);
  }

  public getAllSessions(): Session[] {
    return Array.from(this.sessions.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public hasSession(id: string): boolean {
    return this.sessions.has(id);
  }
}
