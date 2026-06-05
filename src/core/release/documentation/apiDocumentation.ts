export class ApiDocumentation {
  public getContent(): string {
    return `# Kairo-AI API Reference Manual

Welcome to the Kairo-AI Core API reference documentation. This guide details the programmatic interfaces and contracts for integrating with Kairo-AI subsystems.

## 1. Platform Validation Engine
Exposes unified providers registration, dependency scanning, and dry-run execution pipelines.

### class PlatformValidationEngine
\`\`\`typescript
import { platformValidationEngine } from './src/core/platformValidation/platformValidationEngine';
\`\`\`

#### Methods
- \`registerProvider(provider: IValidationProvider): void\`
  Registers an extensible validation auditor. Throws if the ID is already bound.
- \`runAllValidations(): Promise<{ results: Record<string, ValidationResult>; health: HealthScoreStatus }>\`
  Triggers architecture audits, interface checks, and executes a dry-run of the 13-stage dataset-to-inference pipeline.

## 2. Runtime Verification Engine
Continuously monitors runtime health status, hardware configurations, and executes inference replay sessions.

### class RuntimeValidationEngine
\`\`\`typescript
import { runtimeValidationEngine } from './src/core/runtimeValidation/runtimeValidationEngine';
\`\`\`

#### Methods
- \`runAllValidations(): Promise<{ results: Record<string, RuntimeValidationResult>; health: RuntimeHealthStatus }>\`
  Triggers model loaders, prompt compilers, context managers, and stress metrics validation runs. Writes Markdown logs to the workspace root.
- \`recordSessionReplay(session: InferenceReplaySession): void\`
  Caches detailed prompt, context, token timings, and event telemetry traces.
- \`replaySession(sessionId: string): InferenceReplaySession | undefined\`
  Reconstructs a recorded inference execution path for latency and memory leak debugging.

## 3. Distributed Training Coordinator
Configures multi-node communication bounds, data parallel distributions, and synchronization barrier thresholds.

### class DistributedTrainingCoordinator
\`\`\`typescript
import { distributedTraining } from './src/core/distributedTraining/distributedTraining';
\`\`\`

#### Methods
- \`initializeCluster(nodesCount: number): Promise<void>\`
  Hooks up communications networks and tests nodes heartbeat channels.
`;
  }
}

export const apiDocumentation = new ApiDocumentation();
