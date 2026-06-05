export class PluginGuide {
  public getContent(): string {
    return `# Kairo-AI Plugin Development Guide

Learn how to write custom plugins that register with the Platform and Runtime Validation Engine.

## Creating a Plugin
A validation provider plugin must implement the \`IValidationProvider\` interface:
\`\`\`typescript
export interface IValidationProvider {
  readonly id: string;
  readonly name: string;
  readonly targetSubsystem: string;
  validate(context: ValidationContext): Promise<ValidationResult>;
}
\`\`\`

## Sandbox Restrictions
Custom plugins run inside containment monitors. Access to external directories, sockets, and local execution paths is strictly audited.
`;
  }
}

export const pluginGuide = new PluginGuide();
