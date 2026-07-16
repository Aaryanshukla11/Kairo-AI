import { vscodeBridge } from './vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../common/protocol';
import { WorkspaceSnapshot } from '../../extension/workspace/WorkspaceSnapshot';

export class WorkspaceService {
  /**
   * Triggers a workspace scan request to the extension host.
   */
  public async scanWorkspace(): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN, // To be mapped to WORKSPACE_SCAN_REQUEST in protocol later
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'SCAN' },
      version: '1.0.0' as any
    });
  }

  /**
   * Requests the latest snapshot from the extension host.
   */
  public async getSnapshot(): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_SNAPSHOT' },
      version: '1.0.0' as any
    });
  }

  /**
   * Forces a refresh of the workspace index.
   */
  public async refresh(): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'REFRESH' },
      version: '1.0.0' as any
    });
  }
}

export const workspaceService = new WorkspaceService();
