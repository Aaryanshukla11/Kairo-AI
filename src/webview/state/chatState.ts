export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'ERROR' | 'PLAN_PROPOSAL';
export type MessageStatus = 'PENDING' | 'SENT' | 'ERROR' | 'SUCCESS';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  timestamp: number;
  content: string;
  status: MessageStatus;
  plan?: any;
  approval?: any;
  timeline?: any;
  executionProgress?: any;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isStreaming: boolean;
}

export const initialChatState: ChatState = {
  messages: [],
  isTyping: false,
  isStreaming: false,
};

