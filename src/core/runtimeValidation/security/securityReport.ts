import { SecurityAuditResult } from '../runtimeTypes';

export class SecurityReport {
  public compileReport(result: SecurityAuditResult): string {
    const checkStatus = (ok: boolean) => ok ? '🟢 PASSED' : '🔴 FAILED';
    
    return `# Security Audit Report

Generated: ${new Date().toUTCString()}

## Security Isolation & Controls Matrix
- **Workspace Directory Isolation**: ${checkStatus(result.workspaceIsolated)}
- **Plugin Sandbox Isolation**: ${checkStatus(result.pluginIsolated)}
- **Safe Edit Integration checks**: ${checkStatus(result.safeEditIntegrated)}
- **Filesystem Permissions Policy Protection**: ${checkStatus(result.filesystemProtected)}
- **Model Weight Checksums Validation**: ${checkStatus(result.checksumValidated)}
- **Artifact Manifest Integrity validation**: ${checkStatus(result.artifactIntegrityPassed)}
- **Agent Permission Escalation checks**: ${checkStatus(result.permissionsValidated)}
- **Command Sandboxing Controls Enforcement**: ${checkStatus(result.sandboxEnforced)}
- **CLI Shell Commands Validation**: ${checkStatus(result.commandsValidated)}

## Audited Violations & Alerts List
${result.violations.length === 0 ? '_No security policy violations detected in this audit pass._' : result.violations.map((v, i) => `[ALERT #${i+1}] ${v}`).join('\n')}

## Core Recommendations & Actions
1. **Command whitelist enforcement**: Maintain active whitelist filtering on git and code compilation tools.
2. **Environment secrets isolation**: Never set private repository API tokens directly to parent environment variables. Use VS Code secrets keychain stores.
3. **Artifact immutability policies**: Force read-only access flags on saved GGUF, ONNX, and Safetensors checkpoint directories.
`;
  }
}

export const securityReport = new SecurityReport();
