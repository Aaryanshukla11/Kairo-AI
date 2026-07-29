import { ValidationProvider } from '../validationRegistry';

export class TypeScriptValidation implements ValidationProvider {
  public name = 'TypeScriptValidationRules';
  public validateContent(content: string): string[] {
    return content.includes('// @ts-ignore') ? ['TS-01: Found ts-ignore directive'] : [];
  }
}

export const typescriptValidation = new TypeScriptValidation();
