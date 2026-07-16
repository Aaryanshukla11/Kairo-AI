import { MessageType, ProtocolVersion, MessageSource, MessageTarget } from "./messageTypes";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ProtocolValidator {
  public static validate(message: any): ValidationResult {
    const errors: string[] = [];

    if (!message || typeof message !== 'object') {
      return { valid: false, errors: ['Message must be an object'] };
    }

    if (!message.id || typeof message.id !== 'string') {
      errors.push('Missing or invalid "id"');
    }

    if (!message.type || !Object.values(MessageType).includes(message.type)) {
      errors.push('Missing or invalid "type"');
    }

    if (!message.timestamp || typeof message.timestamp !== 'number') {
      errors.push('Missing or invalid "timestamp"');
    }

    if (!message.source || !Object.values(MessageSource).includes(message.source)) {
      errors.push('Missing or invalid "source"');
    }

    if (!message.target || !Object.values(MessageTarget).includes(message.target)) {
      errors.push('Missing or invalid "target"');
    }

    if (!message.version || !Object.values(ProtocolVersion).includes(message.version)) {
      errors.push('Missing or invalid "version"');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
