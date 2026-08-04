export class IntegrityValidator {
  public verifyIntegrity(
    fileList: { filename: string; size: number; checksum: string }[],
    expectedChecksums: Record<string, string>
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const file of fileList) {
      if (file.size <= 0) {
        errors.push(`File ${file.filename} is empty or has invalid size.`);
      }
      const expected = expectedChecksums[file.filename];
      if (expected && expected !== file.checksum) {
        errors.push(`Integrity check failed: Checksum mismatch for ${file.filename}. Expected ${expected}, got ${file.checksum}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const integrityValidator = new IntegrityValidator();
export default integrityValidator;
