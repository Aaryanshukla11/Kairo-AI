import { vscodeBridge } from './vscodeBridge';
import { messageBus } from './messageBus';
import { MessageType, MessageSource, MessageTarget } from '../../common/protocol';
import { ApprovalRequest } from '../../core/approval/approvalTypes';

export class ApprovalService {
  public async submitAction(approvalId: string, action: 'approve' | 'reject'): Promise<ApprovalRequest> {
    const id = Date.now().toString();
    return new Promise((resolve, reject) => {
      const successHandler = (msg: any) => {
        messageBus.unsubscribe(MessageType.APPROVAL_ACTION_RESPONSE, successHandler);
        messageBus.unsubscribe(MessageType.ERROR, errorHandler);
        resolve(msg.payload?.approval);
      };

      const errorHandler = (msg: any) => {
        messageBus.unsubscribe(MessageType.APPROVAL_ACTION_RESPONSE, successHandler);
        messageBus.unsubscribe(MessageType.ERROR, errorHandler);
        reject(new Error(msg.payload?.error || 'Failed to process approval action'));
      };

      messageBus.subscribe(MessageType.APPROVAL_ACTION_RESPONSE, successHandler);
      messageBus.subscribe(MessageType.ERROR, errorHandler);

      vscodeBridge.postMessage({
        id,
        type: MessageType.APPROVAL_ACTION,
        timestamp: Date.now(),
        source: MessageSource.WEBVIEW,
        target: MessageTarget.EXTENSION,
        payload: { approvalId, action },
        version: "1.0.0" as any,
      });
    });
  }
}

export const approvalService = new ApprovalService();
