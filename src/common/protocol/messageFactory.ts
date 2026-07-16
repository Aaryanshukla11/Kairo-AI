import { IProtocolMessage, IErrorMessagePayload, ILogMessagePayload } from "./messageSchemas";
import { MessageType, MessageSource, MessageTarget, MessageSeverity, ProtocolVersion } from "./messageTypes";

// Simple ID generator fallback for the environment
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export class MessageFactory {
  public static createMessage<T>(
    type: MessageType,
    source: MessageSource,
    target: MessageTarget,
    payload?: T
  ): IProtocolMessage<T> {
    return {
      id: generateId(),
      type,
      timestamp: Date.now(),
      source,
      target,
      payload,
      version: ProtocolVersion.V1
    };
  }

  public static createError(
    source: MessageSource,
    target: MessageTarget,
    message: string,
    severity: MessageSeverity = MessageSeverity.ERROR,
    stack?: string
  ): IProtocolMessage<IErrorMessagePayload> {
    return this.createMessage(MessageType.ERROR, source, target, {
      message,
      severity,
      stack
    });
  }

  public static createLog(
    source: MessageSource,
    target: MessageTarget,
    message: string,
    data?: any
  ): IProtocolMessage<ILogMessagePayload> {
    return this.createMessage(MessageType.LOG, source, target, {
      message,
      data
    });
  }

  public static createInfo(
    source: MessageSource,
    target: MessageTarget,
    message: string,
    data?: any
  ): IProtocolMessage<ILogMessagePayload> {
    return this.createMessage(MessageType.INFO, source, target, {
      message,
      data
    });
  }

  public static createWarning(
    source: MessageSource,
    target: MessageTarget,
    message: string,
    data?: any
  ): IProtocolMessage<ILogMessagePayload> {
    return this.createMessage(MessageType.WARNING, source, target, {
      message,
      data
    });
  }
}
