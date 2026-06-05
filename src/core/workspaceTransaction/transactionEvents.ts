export type TransactionEventListener = (event: any) => void;

export class TransactionEvents {
  private listeners = new Set<TransactionEventListener>();

  public subscribe(listener: TransactionEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: string, payload?: any): void {
    for (const listener of this.listeners) {
      try {
        listener({ type, timestamp: Date.now(), payload });
      } catch (err) {
        console.error('Error in Transaction event listener:', err);
      }
    }
  }
}
export const transactionEvents = new TransactionEvents();
