import { IProtocolMessage, MessageType as ProtocolMessageType } from '../common/protocol';

export type MessageType = ProtocolMessageType;

// Preserve legacy structure compatibility for bridge wrapper whilst extending the typed strict payload
export interface BridgeMessage extends Partial<IProtocolMessage> {
  type: MessageType;
  payload?: any;
  timestamp?: number;
  source?: any;
  messageId?: string;
}
