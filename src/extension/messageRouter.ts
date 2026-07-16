import * as vscode from 'vscode';
import { BridgeMessage } from '../shared/messages';
import { PromptDispatcher } from './pipeline/PromptDispatcher';
import { MessageFactory } from '../common/protocol';
import { MessageType, MessageSource, MessageTarget } from '../common/protocol';
import { randomUUID } from 'crypto';
import { plannerEngine } from '../core/planner';

export class MessageRouter {
  private promptDispatcher: PromptDispatcher;

  constructor(private readonly webview: vscode.Webview) {
    this.promptDispatcher = new PromptDispatcher();
  }

  public handleMessage(message: BridgeMessage): void {
    if (!message || !message.type) {
      return;
    }

    switch (message.type) {
      case 'INIT':
        this._handleInit(message);
        break;
      case 'READY':
        this._handleReady(message);
        break;
      case 'PING':
        this._handlePing(message);
        break;
      case 'PONG':
        this._handlePong(message);
        break;
      case 'ERROR':
        this._handleError(message);
        break;
      case 'LOG':
        this._handleLog(message);
        break;
      case 'PROMPT_REQUEST':
        this._handlePromptRequest(message);
        break;
      case 'SEND_PROMPT':
        this._handleSendPrompt(message);
        break;
      case 'PLAN_REQUEST':
        this._handlePlanRequest(message);
        break;
      default:
        console.warn(`[Sasta-Antigravity] Unhandled message type: ${message.type}`);
    }
  }

  public postMessage(message: any): void {
    message.timestamp = Date.now();
    message.source = 'extension';
    this.webview.postMessage(message);
  }

  private _handlePlanRequest(message: BridgeMessage): void {
    try {
      const plan = plannerEngine.generatePlan(message.payload?.prompt || '');
      const responseMsg = MessageFactory.createMessage(
        MessageType.PLAN_RESPONSE,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { plan }
      );
      this.postMessage(responseMsg);
    } catch (error: any) {
      const errorMsg = MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      );
      this.postMessage(errorMsg);
    }
  }

  private async _handlePromptRequest(message: BridgeMessage): Promise<void> {
    const result = await this.promptDispatcher.dispatch(message.payload);
    const responseMsg = MessageFactory.createMessage(
      MessageType.PROMPT_RESPONSE,
      MessageSource.EXTENSION,
      MessageTarget.WEBVIEW,
      result
    );
    this.postMessage(responseMsg);
  }

  private _handleSendPrompt(message: BridgeMessage): void {
    // Acknowledge receipt
    const receivedMsg = MessageFactory.createMessage(
      MessageType.PROMPT_RECEIVED,
      MessageSource.EXTENSION,
      MessageTarget.WEBVIEW,
      { promptId: message.payload?.id }
    );
    this.postMessage(receivedMsg);

    // Mock delay and response
    setTimeout(() => {
      const responseMsg = MessageFactory.createMessage(
        MessageType.MOCK_RESPONSE,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        {
          id: randomUUID(),
          role: 'ASSISTANT',
          content: "AIIdle received your prompt successfully.\n\nPlanner has not been connected yet.\n\nThis is a mock response from the Extension Host.",
          timestamp: Date.now(),
          status: 'SUCCESS'
        }
      );
      this.postMessage(responseMsg);
    }, 400);
  }

  private _handleInit(message: BridgeMessage): void {
    this.postMessage({ type: 'READY' });
  }

  private _handleReady(message: BridgeMessage): void {}

  private _handlePing(message: BridgeMessage): void {
    this.postMessage({ type: 'PONG', payload: message.payload });
  }

  private _handlePong(message: BridgeMessage): void {}

  private _handleError(message: BridgeMessage): void {
    console.error(`[Sasta-Antigravity] Webview Error:`, message.payload);
  }

  private _handleLog(message: BridgeMessage): void {
    console.log(`[Sasta-Antigravity] Webview Log:`, message.payload);
  }
}
