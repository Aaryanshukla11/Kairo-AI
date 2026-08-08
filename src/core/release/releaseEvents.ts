export type ReleaseEventListener = (event: { type: string; payload: any; timestamp: number }) => void;

export class ReleaseEvents {
  private listeners = new Set<ReleaseEventListener>();
  private static instance: ReleaseEvents;

  public static getInstance(): ReleaseEvents {
    if (!ReleaseEvents.instance) {
      ReleaseEvents.instance = new ReleaseEvents();
    }
    return ReleaseEvents.instance;
  }

  public subscribe(listener: ReleaseEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public publish(type: string, payload: any): void {
    const timestamp = Date.now();
    for (const listener of this.listeners) {
      try {
        listener({ type, payload, timestamp });
      } catch (err) {
        console.error('Error in Release listener:', err);
      }
    }
  }
}

export const releaseEvents = ReleaseEvents.getInstance();
