import { BridgeMessage, MessageType } from '../../shared/messages';
import { messageBus } from './messageBus';

interface VSCodeAPI {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

declare function acquireVsCodeApi(): VSCodeAPI;

class VSCodeBridge {
  private api: VSCodeAPI | null = null;
  private messageListener: (event: MessageEvent) => void;

  constructor() {
    if (typeof acquireVsCodeApi === 'function') {
      this.api = acquireVsCodeApi();
    }

    this.messageListener = (event: MessageEvent) => {
      const message = event.data as BridgeMessage;
      if (message && message.type) {
        this.receiveMessage(message);
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  public postMessage(message: BridgeMessage): void {
    message.timestamp = Date.now();
    message.source = 'webview';
    this.api?.postMessage(message);
  }

  private receiveMessage(message: BridgeMessage): void {
    messageBus.publish(message);
  }

  public getState(): any {
    return this.api?.getState();
  }

  public setState(state: any): void {
    this.api?.setState(state);
  }

  public subscribe(type: MessageType, handler: (message: BridgeMessage) => void): void {
    messageBus.subscribe(type, handler);
  }

  public unsubscribe(type: MessageType, handler: (message: BridgeMessage) => void): void {
    messageBus.unsubscribe(type, handler);
  }

  public dispose(): void {
    window.removeEventListener('message', this.messageListener);
    messageBus.clear();
  }
}

export const vscodeBridge = new VSCodeBridge();
