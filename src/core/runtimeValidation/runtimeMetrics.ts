import { SubsystemTelemetry, RuntimeHealthStatus } from './runtimeTypes';

export class RuntimeMetrics {
  private telemetryBuffer: SubsystemTelemetry[] = [];
  private readonly maxBufferSize = 500;

  public logTelemetry(telemetry: SubsystemTelemetry): void {
    this.telemetryBuffer.push({ ...telemetry });
    if (this.telemetryBuffer.length > this.maxBufferSize) {
      this.telemetryBuffer.shift();
    }
  }

  public getTelemetryHistory(): SubsystemTelemetry[] {
    return [...this.telemetryBuffer];
  }

  public getAverageCpu(): number {
    if (this.telemetryBuffer.length === 0) return 15;
    const sum = this.telemetryBuffer.reduce((acc, curr) => acc + curr.cpuUsage, 0);
    return Math.round(sum / this.telemetryBuffer.length);
  }

  public getAverageRam(): number {
    if (this.telemetryBuffer.length === 0) return 120 * 1024 * 1024; // 120MB
    const sum = this.telemetryBuffer.reduce((acc, curr) => acc + curr.ramUsageBytes, 0);
    return Math.round(sum / this.telemetryBuffer.length);
  }

  public getPeakRam(): number {
    if (this.telemetryBuffer.length === 0) return 150 * 1024 * 1024;
    return Math.max(...this.telemetryBuffer.map(t => t.ramUsageBytes));
  }

  public getAverageLatency(): number {
    const list = this.telemetryBuffer.filter(t => t.latencyMs !== undefined);
    if (list.length === 0) return 250;
    const sum = list.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0);
    return Math.round(sum / list.length);
  }

  public clear(): void {
    this.telemetryBuffer = [];
  }
}

export const runtimeMetrics = new RuntimeMetrics();
