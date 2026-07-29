import { SimulationEventListener } from './simulationTypes';

export class SimulationEvents {
  private listeners = new Set<SimulationEventListener>();

  public subscribe(listener: SimulationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: string, payload?: any): void {
    for (const listener of this.listeners) {
      try {
        listener({ type, timestamp: Date.now(), payload });
      } catch (err) {
        console.error('Error in Simulation event listener:', err);
      }
    }
  }
}
export const simulationEvents = new SimulationEvents();
