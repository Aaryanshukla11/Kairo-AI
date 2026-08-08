export class ExecutionFormatter {
  public formatCode(code: string, language: string): string {
    // Standardize newline formatting and basic indents boundaries
    return code.trim() + '\n';
  }
}

export const executionFormatter = new ExecutionFormatter();
