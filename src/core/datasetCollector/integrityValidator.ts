import { CollectedFileItem, IntegrityReport } from './collectorTypes';

export class IntegrityValidator {
  public validate(files: CollectedFileItem[]): IntegrityReport {
    const errors: string[] = [];
    const unreadableFiles: string[] = [];
    const missingChecksums: string[] = [];
    const emptyFiles: string[] = [];

    for (const file of files) {
      if (!file.filePath) {
        errors.push(`Integrity validation error: File entry missing filePath.`);
        continue;
      }

      if (file.content === undefined || file.content === null) {
        unreadableFiles.push(file.filePath);
        errors.push(`Integrity validation error: File is unreadable/null: ${file.filePath}`);
      } else if (file.content.length === 0) {
        emptyFiles.push(file.filePath);
      }

      if (!file.provenance) {
        errors.push(`Integrity validation error: Missing provenance model for file: ${file.filePath}`);
      } else {
        if (!file.provenance.checksum || file.provenance.checksum.trim() === '') {
          missingChecksums.push(file.filePath);
          errors.push(`Integrity validation error: Missing checksum for file: ${file.filePath}`);
        }

        if (!file.provenance.sampleId || !file.provenance.datasetId) {
          errors.push(`Integrity validation error: Incomplete metadata for file: ${file.filePath}`);
        }
      }
    }

    const isValid = errors.length === 0;

    return {
      timestamp: Date.now(),
      isValid,
      totalFilesChecked: files.length,
      errors,
      unreadableFiles,
      missingChecksums,
      emptyFiles
    };
  }

  public validateSourceReachable(sourcePath: string): { isReachable: boolean; error?: string } {
    if (!sourcePath || sourcePath.trim().length === 0) {
      return { isReachable: false, error: 'Source path is empty.' };
    }
    return { isReachable: true };
  }
}

export const integrityValidator = new IntegrityValidator();
