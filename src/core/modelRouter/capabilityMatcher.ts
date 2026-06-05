import { ModelCapability } from '../modelRegistry/registryTypes';

export class CapabilityMatcher {
  public match(modelCapabilities: ModelCapability[], required: ModelCapability[]): { match: boolean; score: number } {
    if (required.length === 0) {
      return { match: true, score: 1.0 };
    }

    const matches = required.filter(cap => modelCapabilities.includes(cap));
    const score = matches.length / required.length;

    return {
      match: matches.length === required.length,
      score: parseFloat(score.toFixed(2))
    };
  }
}

export const capabilityMatcher = new CapabilityMatcher();
