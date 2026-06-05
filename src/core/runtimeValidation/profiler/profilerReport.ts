import { ProfilerTelemetry } from '../runtimeTypes';

export class ProfilerReport {
  public compileReport(telemetry: ProfilerTelemetry): string {
    return `# Performance Baseline Report

Generated: ${new Date().toUTCString()}

## Execution Latency Profile
- **Startup Time**: ${telemetry.startupTimeMs}ms
- **Model Loading Latency**: ${telemetry.modelLoadingTimeMs}ms
- **Context Window Assembly**: ${telemetry.contextAssemblyMs}ms
- **Prompt Compilation Delay**: ${telemetry.promptCompilationMs}ms
- **Inference Latency (Full Request)**: ${telemetry.inferenceLatencyMs}ms
- **Shutdown / Session Cleanup**: ${telemetry.shutdownTimeMs}ms

## Throughput metrics
- **Token Generation speed**: ${telemetry.tokensPerSec} tokens/sec
- **Estimated Words generated/min**: ${Math.round(telemetry.tokensPerSec * 0.75 * 60)} words/min

## Hardware Resource Utilization
- **Average CPU Load**: ${telemetry.cpuUtilPct}%
- **RAM Utilization**: ${telemetry.ramUtilPct}%
- **GPU Engine Load**: ${telemetry.gpuUtilPct}%
- **VRAM Memory Usage**: ${telemetry.vramUtilPct}%
- **Disk I/O Bandwidth**: ${(telemetry.diskReadWriteBps / (1024 * 1024)).toFixed(2)} MB/s

## Model Loading Benchmarks
- **Checkpoint Import Time**: ${telemetry.checkpointLoadingMs}ms
- **UMA Artifact Packing / Loading**: ${telemetry.artifactLoadingMs}ms
`;
  }
}

export const profilerReport = new ProfilerReport();
