import { ContextItem, ContextPriority } from '../contextTypes';

export class ConversationProvider {
  public collect(messages: any[]): ContextItem[] {
    return messages.map((msg, idx) => ({
      id: `conv-${idx}`,
      source: 'conversation',
      content: `${msg.role}: ${msg.content}`,
      tokenCount: Math.ceil(msg.content.length / 4),
      priority: ContextPriority.High,
      score: 0.7
    }));
  }
}
