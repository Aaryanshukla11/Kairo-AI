import { IReleaseValidationProvider } from './releaseTypes';
import { documentationProvider } from './providers/documentationProvider';
import { releaseProvider } from './providers/releaseProvider';
import { dogfoodingProvider } from './providers/dogfoodingProvider';

export class ReleaseValidator {
  public async validateRelease(version: string): Promise<{
    score: number;
    passed: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let scoreSum = 0;
    let counts = 0;

    const providers: IReleaseValidationProvider[] = [
      documentationProvider,
      releaseProvider,
      dogfoodingProvider
    ];

    for (const prov of providers) {
      try {
        const res = await prov.validate(version);
        scoreSum += res.score;
        counts++;
        if (res.issues) issues.push(...res.issues.map(i => `[${prov.name}] ${i}`));
      } catch (err: any) {
        issues.push(`[${prov.name}] Crash Exception: ${err.message || err}`);
        counts++;
      }
    }

    const score = counts > 0 ? Math.round(scoreSum / counts) : 100;
    
    return {
      score,
      passed: score >= 90 && issues.length === 0,
      issues
    };
  }
}

export const releaseValidator = new ReleaseValidator();
