export class NamingValidator {
  private reservedKeywords = new Set([
    'class', 'interface', 'function', 'let', 'const', 'var', 'import', 'export', 'default', 'extends', 'implements'
  ]);

  public validateName(name: string, symbolType: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Naming Intelligence validation error: Name string cannot be empty');
    }

    if (this.reservedKeywords.has(name)) {
      throw new Error(`Naming Intelligence validation error: Proposed name "${name}" is a reserved language keyword`);
    }

    if (name.length < 3) {
      throw new Error(`Naming Intelligence validation error: Proposed name "${name}" is too short and ambiguous`);
    }
  }
}

export const namingValidator = new NamingValidator();
