import { CleaningRulesConfig } from './cleaningTypes';

export class CleaningRules {
  private defaultConfig: CleaningRulesConfig = {
    rejectCorrupted: true,
    rejectUnreadable: true,
    rejectUnknownEncoding: true,
    rejectMissingMetadata: true,
    rejectUnsupportedFormats: false,
    rejectEmptySamples: true,
    minQualityScoreAllowed: 40
  };

  public getRules(customConfig?: Partial<CleaningRulesConfig>): CleaningRulesConfig {
    return {
      ...this.defaultConfig,
      ...customConfig
    };
  }

  public validateConfig(config: CleaningRulesConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.minQualityScoreAllowed !== undefined) {
      if (config.minQualityScoreAllowed < 0 || config.minQualityScoreAllowed > 100) {
        errors.push('minQualityScoreAllowed must be between 0 and 100.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const cleaningRules = new CleaningRules();
