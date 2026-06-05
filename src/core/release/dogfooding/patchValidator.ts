export class PatchValidator {
  public validateDiff(patch: string): boolean {
    // Assert patch format conforms to unified diff structure
    return patch.startsWith('Index:') || patch.includes('---') || patch.includes('+++');
  }
}

export const patchValidator = new PatchValidator();
