import { vscodeBridge } from './vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../common/protocol';
import { ApprovalDecision } from '../../common/approval';

export class ApprovalService {
  /**
   * Submits a user decision to the Approval Engine backend.
   */
  public async submitDecision(requestId: string, decision: ApprovalDecision): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN, // To be mapped later
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'SUBMIT_DECISION', requestId, decision },
      version: '1.0.0' as any
    });
  }

  /**
   * Retrieves pending approvals from the backend registry.
   */
  public async getPendingApprovals(): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_PENDING_APPROVALS' },
      version: '1.0.0' as any
    });
  }
}

export const approvalService = new ApprovalService();
