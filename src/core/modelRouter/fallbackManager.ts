import { FallbackStrategy } from './routingTypes';

export class FallbackManager {
  public resolveFallback(
    currentModelId: string,
    candidates: string[],
    strategy: FallbackStrategy
  ): string {
    if (candidates.length === 0) {
      throw new Error('Model router fallback error: No alternative candidate models available.');
    }

    switch (strategy) {
      case FallbackStrategy.LowerParameterModel:
        // Try finding a model with "8b" or "7b" or similar
        const smaller = candidates.find(c => c.toLowerCase().includes('7b') || c.toLowerCase().includes('8b'));
        if (smaller) return smaller;
        break;

      case FallbackStrategy.NextBestModel:
      default:
        // Return next candidate in catalog list
        const next = candidates.find(c => c !== currentModelId);
        if (next) return next;
        break;
    }

    return candidates[0];
  }
}

export const fallbackManager = new FallbackManager();
