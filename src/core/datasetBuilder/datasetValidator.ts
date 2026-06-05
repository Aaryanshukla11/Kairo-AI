import { DatasetFileItem, DatasetManifestModel, DatasetValidationReport } from './datasetTypes';

export class DatasetValidator {
  public validate(files: DatasetFileItem[], manifest: DatasetManifestModel): DatasetValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (files.length === 0) {
      errors.push('Dataset validation error: Dataset must contain at least one file.');
    }

    for (const file of files) {
      if (!file.content || !file.content.trim()) {
        errors.push(`Dataset validation error: Empty or corrupted content in file: ${file.path}`);
      }
      
      const ext = file.path.split('.').pop()?.toLowerCase();
      const supported = ['ts', 'js', 'json', 'md', 'txt'];
      if (ext && !supported.includes(ext)) {
        warnings.push(`Unsupported file format warning: ${file.path}`);
      }
    }

    if (!manifest.datasetId) {
      errors.push('Dataset validation error: Manifest lacks dataset ID.');
    }
    if (!manifest.name) {
      errors.push('Dataset validation error: Manifest lacks dataset Name.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const datasetValidator = new DatasetValidator();
