export class InstallationGuide {
  public getContent(): string {
    return `# Kairo-AI Setup and Installation Guide

Follow these steps to deploy and run Kairo-AI as an offline VS Code assistant on your workspace.

## System Prerequisites
- **Operating System**: Windows 10/11, macOS 11+, Linux (Ubuntu 20.04+)
- **System Memory**: 8GB RAM minimum (16GB recommended for model inference)
- **Local Storage**: 500MB free space for extension binaries (excluding models)

## Installation from VSIX (VS Code Package)
1. Generate the installable extension file:
   \`\`\`bash
   npm run package
   \`\`\`
   This will bundle and generate the \`sasta-antigravity-0.1.0-draft.vsix\` file.
2. In VS Code, navigate to the Extensions View (\`Ctrl+Shift+X\`).
3. Click the three dots (\`...\`) in the upper-right corner and choose **Install from VSIX...**.
4. Select the generated \`sasta-antigravity-0.1.0-draft.vsix\` file.

## Configuration & Setup
- On first launch, open a Workspace folder in VS Code.
- Kairo-AI will automatically initialize telemetry and sandbox monitors.
- Default model search directories are set to target the workspace root (\`./models\`).
`;
  }
}

export const installationGuide = new InstallationGuide();
