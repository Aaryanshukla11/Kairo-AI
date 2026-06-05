import * as fs from 'fs';
import * as path from 'path';
import { Diagnostic } from './diagnosticsTypes';
import { formatDiagnostic } from './diagnosticsFormatter';

export class DiagnosticsReporter {
  private logPath: string;

  constructor(workspaceRoot: string) {
    const hasWorkspaceAiidle = fs.existsSync(path.resolve(workspaceRoot, '.aiidle'));
    const logDir = hasWorkspaceAiidle
      ? path.resolve(workspaceRoot, '.aiidle', 'logs')
      : path.resolve(require('os').tmpdir(), 'kairo-logs', path.basename(workspaceRoot));

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logPath = path.join(logDir, 'diagnostics.log');
  }

  /**
   * Appends formatted diagnostics info to filesystem logs.
   */
  public report(diagnostic: Diagnostic): void {
    const line = formatDiagnostic(diagnostic) + '\n---\n';
    try {
      fs.appendFileSync(this.logPath, line, 'utf8');
    } catch {
      // Fallback
    }
  }

  public getLogPath(): string {
    return this.logPath;
  }
}
