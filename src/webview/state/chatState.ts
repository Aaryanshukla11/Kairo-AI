export interface ChatState {
  messages: any[];
  isTyping: boolean;
  isStreaming: boolean;
}

export const initialChatState: ChatState = {
  messages: [],
  isTyping: false,
  isStreaming: false,
};
