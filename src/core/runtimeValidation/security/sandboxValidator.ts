export class SandboxValidator {
  public validateCommand(commandLine: string): { isSafe: boolean; details?: string } {
    // Audit command parameter for unsafe shell command injections (e.g. rm -rf, del, format, curl | sh)
    const dangerousPatterns = [/rm\s+-rf/, /del\s+/, /format\s+/, /curl\s+.*?\|\s*sh/, />\s*\/dev\/null/];
    for (const pattern of dangerousPatterns) {
      if (pattern.test(commandLine)) {
        return {
          isSafe: false,
          details: `Dangerous command execution attempt blocked by sandbox validator: matched pattern '${pattern}'`
        };
      }
    }
    return { isSafe: true };
  }
}

export const sandboxValidator = new SandboxValidator();
