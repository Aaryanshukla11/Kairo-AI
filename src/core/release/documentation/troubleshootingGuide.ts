export class TroubleshootingGuide {
  public getContent(): string {
    return `# Kairo-AI Troubleshooting Guide

Resolve common runtime exceptions, test failures, and sandbox access blocks.

## 1. Extension Activation Fails
- **Error**: \`Cannot find module 'dist/extension.js'\`
- **Solution**: Execute \`npm run build\` to compile React webviews and TypeScript sources to the \`dist/\` bundle directory.

## 2. Sandbox Denied Violations
- **Error**: \`Path escapes workspace containment.\`
- **Solution**: Kairo-AI restricts read/write operations within workspace paths. Ensure target files are located relative to the workspace directory.
`;
  }
}

export const troubleshootingGuide = new TroubleshootingGuide();
