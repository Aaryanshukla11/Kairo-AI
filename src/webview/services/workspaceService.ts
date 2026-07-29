import { vscodeBridge } from './vscodeBridge';
import { messageBus } from './messageBus';
import { MessageType, MessageSource, MessageTarget } from '../../common/protocol';
import { WorkspaceSummary } from '../../core/workspace/workspaceTypes';

export class WorkspaceService {
  /**
   * Requests the WorkspaceSummary from the extension host.
   */
  public async getWorkspaceSummary(): Promise<WorkspaceSummary | string> {
    const id = Date.now().toString();
    return new Promise((resolve, reject) => {
      const successHandler = (msg: any) => {
        messageBus.unsubscribe(MessageType.WORKSPACE_RESPONSE, successHandler);
        messageBus.unsubscribe(MessageType.ERROR, errorHandler);
        resolve(msg.payload?.summary);
      };

      const errorHandler = (msg: any) => {
        messageBus.unsubscribe(MessageType.WORKSPACE_RESPONSE, successHandler);
        messageBus.unsubscribe(MessageType.ERROR, errorHandler);
        reject(new Error(msg.payload?.error || 'Failed to scan workspace'));
      };

      messageBus.subscribe(MessageType.WORKSPACE_RESPONSE, successHandler);
      messageBus.subscribe(MessageType.ERROR, errorHandler);

      vscodeBridge.postMessage({
        id,
        type: MessageType.WORKSPACE_REQUEST,
        timestamp: Date.now(),
        source: MessageSource.WEBVIEW,
        target: MessageTarget.EXTENSION,
        payload: {},
        version: "1.0.0" as any,
      });
    });
  }

  /**
   * Triggers a workspace scan request to the extension host.
   */
  public async scanWorkspace(): Promise<void> {
    this.getWorkspaceSummary().catch(() => {});
  }

  /**
   * Requests the latest snapshot from the extension host.
   */
  public async getSnapshot(): Promise<void> {
    this.getWorkspaceSummary().catch(() => {});
  }

  /**
   * Forces a refresh of the workspace index.
   */
  public async refresh(): Promise<void> {
    this.getWorkspaceSummary().catch(() => {});
  }
}

export const workspaceService = new WorkspaceService();
