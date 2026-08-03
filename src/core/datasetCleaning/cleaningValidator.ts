import { CleanedSample, RejectedSample } from './cleaningTypes';

export class CleaningValidator {
  public validateCleanedSample(sample: CleanedSample): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!sample.filePath) {
      errors.push('Cleaned sample is missing filePath.');
    }

    if (!sample.provenance) {
      errors.push(`Cleaned sample is missing provenance tracking metadata: ${sample.filePath}`);
    } else {
      const requiredProvenanceFields = ['sampleId', 'datasetId', 'filePath', 'checksum', 'language', 'license'];
      for (const field of requiredProvenanceFields) {
        if (!sample.provenance[field as keyof typeof sample.provenance]) {
          errors.push(`Cleaned sample provenance missing required field [${field}]: ${sample.filePath}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public validateRejectedSample(sample: RejectedSample): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!sample.filePath) {
      errors.push('Rejected sample is missing filePath.');
    }

    if (!sample.rejectionReasons || sample.rejectionReasons.length === 0) {
      errors.push(`Rejected sample is missing rejection reasons: ${sample.filePath}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const cleaningValidator = new CleaningValidator();
