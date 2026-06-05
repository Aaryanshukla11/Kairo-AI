export class JsonSchemaValidator {
  public validate(data: any, schema: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    for (const key of Object.keys(schema)) {
      if (schema[key].required && (data[key] === undefined || data[key] === null)) {
        errors.push(`Missing required field: '${key}'`);
      } else if (data[key] !== undefined && typeof data[key] !== schema[key].type) {
        errors.push(`Type mismatch for field '${key}': expected ${schema[key].type}, got ${typeof data[key]}`);
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const jsonSchemaValidator = new JsonSchemaValidator();
