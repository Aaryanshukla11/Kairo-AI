export class DebugValidator {
  public validateDiagnostics(diagnostics: any): void {
    if (!diagnostics) {
      throw new Error('Debug validation error: Missing diagnostics context data');
    }
    if (!diagnostics.errorName && !diagnostics.message) {
      throw new Error('Debug validation error: Incomplete diagnostics details');
    }
  }

  public validateLogs(logs: string[]): void {
    if (!logs || logs.length === 0) {
      throw new Error('Debug validation error: Corrupted logs (empty or missing execution history logs)');
    }
  }

  public validateEnvironment(language: string, runtime: string): void {
    const supportedLangs = ['typescript', 'javascript', 'json', 'markdown', 'css', 'html', 'shell', 'bash'];
    const supportedRuntimes = ['node', 'browser', 'vscode', 'simulated'];

    if (!supportedLangs.includes(language.toLowerCase())) {
      throw new Error(`Debug validation error: Unknown language "${language}"`);
    }

    if (!supportedRuntimes.includes(runtime.toLowerCase())) {
      throw new Error(`Debug validation error: Unsupported runtime environment "${runtime}"`);
    }
  }
}

export const debugValidator = new DebugValidator();
