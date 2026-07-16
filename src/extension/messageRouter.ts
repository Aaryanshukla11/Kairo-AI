import * as vscode from 'vscode';
import { BridgeMessage } from '../shared/messages';

export class MessageRouter {
  constructor(private readonly webview: vscode.Webview) {}

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
      default:
        console.warn(`[Sasta-Antigravity] Unhandled message type: ${message.type}`);
    }
  }

  public postMessage(message: BridgeMessage): void {
    message.timestamp = Date.now();
    message.source = 'extension';
    this.webview.postMessage(message);
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
