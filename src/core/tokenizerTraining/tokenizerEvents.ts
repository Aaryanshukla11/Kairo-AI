import { TokenizerEvent, TokenizerEventListener, TokenizerEventType } from './tokenizerTypes';

export class TokenizerEvents {
  private listeners = new Set<TokenizerEventListener>();

  public subscribe(listener: TokenizerEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: TokenizerEventType, payload?: any): TokenizerEvent {
    const event: TokenizerEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in tokenizer event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const tokenizerEvents = new TokenizerEvents();
export default tokenizerEvents;
