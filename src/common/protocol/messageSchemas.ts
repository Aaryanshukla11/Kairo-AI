import { MessageType, MessageSource, MessageTarget, MessageSeverity, ProtocolVersion } from "./messageTypes";

export interface BaseMessagePayload {
  [key: string]: any;
}

export interface IProtocolMessage<T = BaseMessagePayload> {
  id: string;
  type: MessageType;
  timestamp: number;
  source: MessageSource;
  target: MessageTarget;
  payload?: T;
  version: ProtocolVersion;
}

export interface IErrorMessagePayload extends BaseMessagePayload {
  message: string;
  stack?: string;
  severity: MessageSeverity;
}

export interface ILogMessagePayload extends BaseMessagePayload {
  message: string;
  data?: any;
}
