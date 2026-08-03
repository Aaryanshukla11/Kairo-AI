import { BudgetEvent, BudgetEventListener, BudgetEventType } from './budgetTypes';

export class BudgetEvents {
  private listeners = new Set<BudgetEventListener>();

  public subscribe(listener: BudgetEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: BudgetEventType, payload?: any): void {
    const event: BudgetEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in budget manager event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const budgetEvents = new BudgetEvents();
