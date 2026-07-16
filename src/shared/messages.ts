export type MessageType = "INIT" | "READY" | "PING" | "PONG" | "ERROR" | "LOG";

export interface BridgeMessage {
  type: MessageType;
  payload?: any;
  timestamp?: number;
  source?: "extension" | "webview";
  messageId?: string;
}
