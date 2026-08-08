export class TrainingGuide {
  public getContent(): string {
    return `# Kairo-AI Model Training Guide

This guide details configuring parameters, schedulers, and learning rates during optimization runtime.

## Optimization Scheduling
- Configures epochs, learning rates decays, and checkpoints.
- Uses AdamW parameter decay bounds.

## Mixed Precision Modes
- Supports \`fp16\`, \`bf16\`, and \`fp32\` precision.
- Keeps dynamic scale scaling policies checks to prevent numerical overflows.
`;
  }
}

export const trainingGuide = new TrainingGuide();
