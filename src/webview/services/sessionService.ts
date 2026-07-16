import { vscodeBridge } from './vscodeBridge';
import { messageBus } from './messageBus';
import { MessageType, MessageSource, MessageTarget } from '../../common/protocol';
import { Session, SessionEventType } from '../../common/session';

export class SessionService {
  /**
   * Dispatches a session creation request to the extension host.
   */
  public async createSession(title?: string): Promise<void> {
    // Note: Implementation of actual request/response mapping will occur in a later ticket.
    // For now, this is strictly the architectural scaffolding.
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN, // To be mapped to a formal SESSION_REQUEST in the future
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'CREATE', title },
      version: '1.0.0' as any
    });
  }

  /**
   * Switches the active session within the extension registry.
   */
  public async switchSession(id: string): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'SWITCH', id },
      version: '1.0.0' as any
    });
  }
}

export const sessionService = new SessionService();
