import * as vscode from 'vscode';
import { BridgeMessage } from '../shared/messages';
import { PromptDispatcher } from './pipeline/PromptDispatcher';
import { MessageFactory } from '../common/protocol';
import { MessageType, MessageSource, MessageTarget } from '../common/protocol';

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
      default:
        console.warn(`[Sasta-Antigravity] Unhandled message type: ${message.type}`);
    }
  }

  public postMessage(message: any): void {
    message.timestamp = Date.now();
    message.source = 'extension';
    this.webview.postMessage(message);
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
