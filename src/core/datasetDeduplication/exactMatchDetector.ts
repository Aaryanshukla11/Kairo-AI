import { Fingerprint } from './deduplicationTypes';

export class ExactMatchDetector {
  public isExactMatch(f1: Fingerprint, f2: Fingerprint): boolean {
    return f1.exactHash === f2.exactHash && f1.exactHash !== 'empty';
  }
}

export const exactMatchDetector = new ExactMatchDetector();
export default exactMatchDetector;
