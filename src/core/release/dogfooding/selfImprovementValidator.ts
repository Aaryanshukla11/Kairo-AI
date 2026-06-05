export class SelfImprovementValidator {
  public validateCode(code: string): { isCompilable: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!code.includes('export')) {
      issues.push('Missing exports declaration declarations.');
    }
    return {
      isCompilable: issues.length === 0,
      issues
    };
  }
}

export const selfImprovementValidator = new SelfImprovementValidator();
