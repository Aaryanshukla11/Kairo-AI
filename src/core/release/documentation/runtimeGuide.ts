export class RuntimeGuide {
  public getContent(): string {
    return `# Kairo-AI Runtime Execution Guide

This guide describes how the runtime verification and telemetry engines operate in production environments.

## Runtime Coordinator Loop
- telemetry is polled every 10 seconds.
- CPU/RAM/VRAM levels are calculated.
- Sessions are monitored for hangups (timeouts trigger watchdog thread restarts).
`;
  }
}

export const runtimeGuide = new RuntimeGuide();
