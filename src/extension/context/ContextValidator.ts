import { ContextSnapshot } from './ContextSnapshot';

export interface ContextValidationResult {
  valid: boolean;
  errors: string[];
}

export class ContextValidator {
  public static validate(snapshot: ContextSnapshot): ContextValidationResult {
    const errors: string[] = [];

    if (!snapshot) {
      return { valid: false, errors: ['Context Snapshot cannot be null.'] };
    }

    if (!snapshot.workspaceName) {
      errors.push('Missing workspace name in Context Snapshot.');
    }

    if (!snapshot.priorities || typeof snapshot.priorities !== 'object') {
      errors.push('Missing or invalid priorities object.');
    }

    // Check for duplicate selections
    if (snapshot.selectedFiles && new Set(snapshot.selectedFiles).size !== snapshot.selectedFiles.length) {
      errors.push('Duplicate entries detected in selected files.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
