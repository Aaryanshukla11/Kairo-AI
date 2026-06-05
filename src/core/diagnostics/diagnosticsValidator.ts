import { Diagnostic } from './diagnosticsTypes';

export class DiagnosticsValidator {
  /**
   * Verifies diagnostic inputs contain source, message, severity, and category tags.
   */
  public validate(diagnostic: Partial<Diagnostic>): void {
    if (!diagnostic.sourceModule || !diagnostic.sourceModule.trim()) {
      throw new Error('Diagnostics validation error: Source module is required');
    }

    if (!diagnostic.message || !diagnostic.message.trim()) {
      throw new Error('Diagnostics validation error: Message content is required');
    }

    if (!diagnostic.severity) {
      throw new Error('Diagnostics validation error: Severity tag is required');
    }

    if (!diagnostic.category) {
      throw new Error('Diagnostics validation error: Category tag is required');
    }
  }
}

export const diagnosticsValidator = new DiagnosticsValidator();
