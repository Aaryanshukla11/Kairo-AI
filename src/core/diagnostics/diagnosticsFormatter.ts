import { Diagnostic } from './diagnosticsTypes';

/**
 * Formats diagnostic records into standardized string templates.
 */
export function formatDiagnostic(diag: Diagnostic): string {
  const timestamp = new Date(diag.timestamp).toISOString();
  let output = `[${timestamp}] [${diag.severity}] [${diag.category}] [${diag.sourceModule}] ${diag.message}`;
  if (diag.operationId) {
    output += ` (OpID: ${diag.operationId})`;
  }
  if (diag.details) {
    output += `\nDetails: ${diag.details}`;
  }
  if (diag.stackTrace) {
    output += `\nStack Trace: ${diag.stackTrace}`;
  }
  return output;
}
