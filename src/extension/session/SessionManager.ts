import { SessionRegistry } from './SessionRegistry';
import { SessionFactory, SessionState, SessionEventType, Session } from '../../common/session';

export class SessionManager {
  private registry: SessionRegistry;

  constructor() {
    this.registry = new SessionRegistry();
  }

  public createSession(title?: string, workspaceId?: string): Session {
    const newSession = SessionFactory.createSession(title, workspaceId);
    this.registry.addSession(newSession);
    this.registry.setCurrentSessionId(newSession.id);
    this.emitEvent(SessionEventType.SESSION_CREATED, newSession);
    return newSession;
  }

  public closeSession(id: string): Session | undefined {
    const session = this.registry.getSession(id);
    if (!session) return undefined;

    const updated = SessionFactory.updateSession(session, { status: SessionState.COMPLETED } as any);
    this.registry.updateSession(updated);
    this.emitEvent(SessionEventType.SESSION_CLOSED, updated);
    return updated;
  }

  public renameSession(id: string, newTitle: string): Session | undefined {
    const session = this.registry.getSession(id);
    if (!session) return undefined;

    const updated = SessionFactory.updateSession(session, { title: newTitle });
    this.registry.updateSession(updated);
    this.emitEvent(SessionEventType.SESSION_RENAMED, updated);
    return updated;
  }

  public switchSession(id: string): Session | undefined {
    if (!this.registry.hasSession(id)) return undefined;
    this.registry.setCurrentSessionId(id);
    const session = this.registry.getCurrentSession()!;
    this.emitEvent(SessionEventType.SESSION_SWITCHED, session);
    return session;
  }

  public deleteSession(id: string): boolean {
    const session = this.registry.getSession(id);
    if (!session) return false;
    const success = this.registry.deleteSession(id);
    if (success) {
      this.emitEvent(SessionEventType.SESSION_DELETED, { id });
    }
    return success;
  }

  public getCurrentSession(): Session | undefined {
    return this.registry.getCurrentSession();
  }

  private emitEvent(_eventType: SessionEventType, _payload: any): void {
    // To be wired to the extension MessageRouter for IPC broadcast to Webview
    // Example: MessageRouter.broadcast(MessageFactory.createMessage('SESSION_EVENT', ...))
  }
}
