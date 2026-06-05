import { SubsystemTelemetry } from './runtimeTypes';

export type TelemetryListener = (telemetry: SubsystemTelemetry) => void;

export class RuntimeEvents {
  private listeners = new Set<TelemetryListener>();
  private static instance: RuntimeEvents;

  public static getInstance(): RuntimeEvents {
    if (!RuntimeEvents.instance) {
      RuntimeEvents.instance = new RuntimeEvents();
    }
    return RuntimeEvents.instance;
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public publish(telemetry: SubsystemTelemetry): void {
    for (const listener of this.listeners) {
      try {
        listener(telemetry);
      } catch (err) {
        console.error('Error in Telemetry listener:', err);
      }
    }
  }
}

export const runtimeEvents = RuntimeEvents.getInstance();
