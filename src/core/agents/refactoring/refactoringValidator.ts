export class RefactoringValidator {
  public validateAnalysisRequest(request: any): void {
    if (!request) {
      throw new Error('Refactoring validation error: Missing analysis request body');
    }
    if (!request.files || !Array.isArray(request.files) || request.files.length === 0) {
      throw new Error('Refactoring validation error: Incomplete analysis request - files list is empty');
    }
  }

  public validatePlan(plan: any): void {
    if (plan.preservesBehavior === false) {
      throw new Error('Refactoring validation error: Rejected behavior-changing refactoring plan');
    }
    if (plan.hasDependencyCycles === true) {
      throw new Error('Refactoring validation error: Rejected refactoring plan due to broken dependency graph cycles');
    }
    if (!plan.associatedTests || plan.associatedTests.length === 0) {
      throw new Error('Refactoring validation error: Rejected refactoring plan - missing tests verification target');
    }
  }
}

export const refactoringValidator = new RefactoringValidator();
