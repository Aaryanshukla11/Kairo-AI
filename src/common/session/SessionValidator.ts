import { Session } from './Session';
import { SessionState } from './SessionState';

export interface SessionValidationResult {
  valid: boolean;
  errors: string[];
}

export class SessionValidator {
  public static validate(session: any): SessionValidationResult {
    const errors: string[] = [];

    if (!session || typeof session !== 'object') {
      return { valid: false, errors: ['Session must be a valid object.'] };
    }

    if (!session.id || typeof session.id !== 'string') {
      errors.push('Missing or invalid session ID.');
    }

    if (!session.title || typeof session.title !== 'string') {
      errors.push('Missing or invalid session title.');
    }

    if (!session.status || !Object.values(SessionState).includes(session.status)) {
      errors.push('Missing or invalid session state.');
    }

    if (typeof session.createdAt !== 'number' || typeof session.updatedAt !== 'number') {
      errors.push('Invalid timestamps.');
    }

    if (!session.metadata || typeof session.metadata !== 'object') {
      errors.push('Missing session metadata object.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
