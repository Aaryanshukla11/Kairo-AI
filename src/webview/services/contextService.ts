import { vscodeBridge } from './vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../common/protocol';

export class ContextService {
  /**
   * Triggers a context build request to the extension host.
   */
  public async buildContext(): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN, // To be mapped to CONTEXT_BUILD_REQUEST in protocol later
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'BUILD_CONTEXT' },
      version: '1.0.0' as any
    });
  }

  /**
   * Requests the current context snapshot from the extension host.
   */
  public async getCurrentContext(): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_CONTEXT' },
      version: '1.0.0' as any
    });
  }

  /**
   * Forces a refresh of the current context.
   */
  public async refresh(): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'REFRESH_CONTEXT' },
      version: '1.0.0' as any
    });
  }
}

export const contextService = new ContextService();
