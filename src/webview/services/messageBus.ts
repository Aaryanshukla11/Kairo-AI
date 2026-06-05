import { BridgeMessage, MessageType } from '../../shared/messages';

type MessageHandler = (message: BridgeMessage) => void;

class MessageBus {
  private listeners: Map<MessageType, Set<MessageHandler>> = new Map();

  public subscribe(type: MessageType, handler: MessageHandler): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(handler);
  }

  public unsubscribe(type: MessageType, handler: MessageHandler): void {
    this.listeners.get(type)?.delete(handler);
  }

  public once(type: MessageType, handler: MessageHandler): void {
    const wrapper = (message: BridgeMessage) => {
      handler(message);
      this.unsubscribe(type, wrapper);
    };
    this.subscribe(type, wrapper);
  }

  public publish(message: BridgeMessage): void {
    const handlers = this.listeners.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const messageBus = new MessageBus();
