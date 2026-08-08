import { cpuProfiler } from './cpuProfiler';
import { memoryProfiler } from './memoryProfiler';
import { gpuProfiler } from './gpuProfiler';
import { latencyProfiler } from './latencyProfiler';
import { throughputProfiler } from './throughputProfiler';
import { storageProfiler } from './storageProfiler';
import { ProfilerTelemetry } from '../runtimeTypes';

export class PerformanceProfiler {
  public async profilePerformance(): Promise<ProfilerTelemetry> {
    const cpu = cpuProfiler.profile();
    const mem = memoryProfiler.profile();
    const gpu = gpuProfiler.profile();
    const latency = latencyProfiler.profile();
    const throughput = throughputProfiler.profile();
    const storage = storageProfiler.profile();

    const ramTotal = 16 * 1024 * 1024 * 1024; // 16GB
    const ramUtilPct = Math.round((mem.ramUsageBytes / ramTotal) * 100);
    const vramUtilPct = Math.round((gpu.vramUsedBytes / gpu.vramTotalBytes) * 100);

    return {
      startupTimeMs: 350,
      shutdownTimeMs: 80,
      modelLoadingTimeMs: latency.modelLoadingTimeMs,
      contextAssemblyMs: latency.contextAssemblyMs,
      promptCompilationMs: latency.promptCompilationMs,
      inferenceLatencyMs: latency.inferenceLatencyMs,
      tokensPerSec: throughput.tokensPerSec,
      cpuUtilPct: cpu.cpuUsage,
      ramUtilPct,
      gpuUtilPct: gpu.gpuUsagePct,
      vramUtilPct,
      diskReadWriteBps: storage.diskReadWriteBps,
      checkpointLoadingMs: 140,
      artifactLoadingMs: 105
    };
  }
}

export const performanceProfiler = new PerformanceProfiler();
