export class SecurityValidator {
  public validateScanRequest(request: any): void {
    if (!request) {
      throw new Error('Security validation error: Missing scan request body');
    }
    if (!request.planId) {
      throw new Error('Security validation error: Missing planId in scan request');
    }
    if (request.tasks && !Array.isArray(request.tasks)) {
      throw new Error('Security validation error: Plan tasks must be an array');
    }
  }

  public validateToolCall(toolId: string, allowedTools: Set<string>): void {
    if (!toolId || !toolId.trim()) {
      throw new Error('Security validation error: Tool invocation ID cannot be empty');
    }
    if (!allowedTools.has(toolId)) {
      throw new Error(`Security validation error: Unknown or unregistered tool "${toolId}"`);
    }
  }

  public validatePolicy(policy: string): void {
    const valid = ['Allow', 'Warn', 'Require Approval', 'Block'];
    if (!valid.includes(policy)) {
      throw new Error(`Security validation error: Unknown or unsupported security policy "${policy}"`);
    }
  }
}

export const securityValidator = new SecurityValidator();
