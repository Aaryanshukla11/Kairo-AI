export class PerformanceMonitor {
  public identifyBottlenecks(cpu: number, gpu: number, queue: number): string[] {
    const bottlenecks: string[] = [];
    if (cpu > 85) bottlenecks.push('CPU Overload Bottleneck');
    if (gpu > 90) bottlenecks.push('GPU VRAM Congestion Bottleneck');
    if (queue > 2) bottlenecks.push('Inference Queue Congestion Bottleneck');
    return bottlenecks;
  }
}

export const performanceMonitor = new PerformanceMonitor();
