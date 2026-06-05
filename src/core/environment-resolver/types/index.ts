export interface IExecutionProfile {
  readonly packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
  readonly installCommand: string;
  readonly buildCommand: string;
  readonly devCommand: string;
  readonly prodCommand: string;
  readonly testCommand: string;
  readonly workingDirectory: string;
  readonly runtime: 'Node.js' | 'Java' | 'Python' | 'Go' | 'Rust' | '.NET' | 'unknown';
  readonly framework: string;
  readonly buildTool: string;
}
