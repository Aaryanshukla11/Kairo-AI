import { ConventionProfile } from './conventionTypes';

export class ConventionValidator {
  public validateSamplesCount(samplesCount: number): void {
    if (samplesCount < 2) {
      throw new Error('Project Convention validation error: Insufficient representative samples (requires at least 2 file targets)');
    }
  }

  public validateProfile(profile: ConventionProfile): void {
    if (!profile) {
      throw new Error('Project Convention validation error: Profiles are missing');
    }
    // Conflicting rules check: if confidence is below 0.1, we assume rule conflict or high noise
    if (profile.confidence < 0.1) {
      throw new Error('Project Convention validation error: Conflicting rules detected in repository files casing configurations');
    }
  }
}

export const conventionValidator = new ConventionValidator();
