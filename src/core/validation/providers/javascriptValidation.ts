import { ValidationProvider } from '../validationRegistry';

export class JavaScriptValidation implements ValidationProvider {
  public name = 'JavaScriptValidationRules';
  public validateContent(content: string): string[] {
    return content.includes('== null') ? ['JS-01: Detected loose null inequality check'] : [];
  }
}

export const javascriptValidation = new JavaScriptValidation();
