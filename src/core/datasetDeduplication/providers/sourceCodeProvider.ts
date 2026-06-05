export class SourceCodeProvider {
  public normalizeIdentifiers(content: string): string {
    if (!content) return '';

    // Strip comments
    let code = content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

    // Normalize whitespaces
    code = code.replace(/\s+/g, ' ').trim();

    // Standardize identifiers (rough token replacement for structural similarity)
    // Replace standard variable/function declarations with standardized placeholder tokens
    code = code.replace(/\b(const|let|var)\s+[a-zA-Z_]\w*/g, '$1 IDENT');
    code = code.replace(/\bfunction\s+[a-zA-Z_]\w*/g, 'function IDENT');

    return code;
  }

  public getCodeTokens(content: string): string[] {
    const normalized = this.normalizeIdentifiers(content);
    return normalized.split(/\s+|(?=[{}()[\],;])|(?<=[{}()[\],;])/).filter(t => t.trim().length > 0);
  }
}

export const sourceCodeProvider = new SourceCodeProvider();
export default sourceCodeProvider;
