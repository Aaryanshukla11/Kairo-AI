export class ArchitectureDocumentation {
  public getContent(): string {
    return `# Kairo-AI System Architecture Guide

This guide details the architectural constraints, subsystem layouts, boundaries, and integration flows of Kairo-AI.

## High-Level Architecture Model
Kairo-AI follows a decoupled, modular design divided into three primary layers:
1. **Developer Shell / Webview View Layer**: Provides real-time dashboard visualization (Platform Health, Runtime Telemetry, Release Checklists) built using React/TypeScript.
2. **Extensions Host Layer**: Coordinates command routing, workspace operations, security sandboxing, and initiates background engines.
3. **Core Engines Layer**: Executes training loops, datasets collections, model serialization/conversions, and runtime verification pipelines.

## Dependency Coupling Constraints
To maintain modularity and avoid dependency leaks:
- Core systems (e.g. \`distributedTraining\`, \`gradientEngine\`) must publish metrics and state modifications via the central \`EventBus\`.
- Direct cross-talk or coupling between unrelated subsystems (e.g. \`webview\` directly accessing \`distributedTraining\` without extension routing messages) is blocked by Module Boundary rules.
- Circular dependencies are audited using static DFS import scanning. Any imports cycles fail validation.

## Unified Model Artifact (UMA) Specification
All exported checkpoints and conversion targets (GGUF, Safetensors, ONNX) must conform to the UMA structure:
- Must contain an \`artifact_manifest.json\` detailing format conversions, timestamps, configuration parameters, and SHA-256 weight checksums.
- Is encapsulated within a target directory structure consisting of \`weights/\`, \`tokenizer/\`, and \`configs/\`.
`;
  }
}

export const architectureDocumentation = new ArchitectureDocumentation();
