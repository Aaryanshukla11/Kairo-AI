import { CollectedFileItem } from '../datasetCollector/collectorTypes';
import { encodingNormalizer } from './encodingNormalizer';

export class CorruptionDetector {
  public detectCorruption(sample: CollectedFileItem): { isCorrupted: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (!sample) {
      return { isCorrupted: true, reasons: ['Sample object is null or undefined.'] };
    }

    const content = sample.content;

    // 1. Unreadable or null content check
    if (content === null || content === undefined) {
      return { isCorrupted: true, reasons: ['File content is unreadable (null/undefined).'] };
    }

    // 2. Binary signatures check (NUL bytes, high binary character density)
    if (this.hasBinarySignatures(content)) {
      reasons.push('Contains binary file signatures or NUL bytes.');
    }

    // 3. Bad encoding check
    if (encodingNormalizer.isCorruptedEncoding(content)) {
      reasons.push('Contains corrupted character encodings (too many Unicode replacement characters).');
    }

    // 4. Truncation or syntax check for structured files (e.g. JSON)
    const ext = (sample.filePath || '').split('.').pop()?.toLowerCase();
    if (ext === 'json') {
      try {
        JSON.parse(content);
      } catch (err: any) {
        // We only flag it as corrupted if it cannot be parsed and has unbalanced braces, meaning it was cut off
        if (this.isTruncatedJson(content)) {
          reasons.push(`Truncated or malformed JSON: ${err.message}`);
        }
      }
    }

    return {
      isCorrupted: reasons.length > 0,
      reasons
    };
  }

  public hasBinarySignatures(content: string): boolean {
    if (content.includes('\0')) {
      return true;
    }

    // Scan the first 1000 characters for control characters (excluding tab, newline, carriage return)
    const scanLimit = Math.min(content.length, 1000);
    let controlCharCount = 0;
    for (let i = 0; i < scanLimit; i++) {
      const code = content.charCodeAt(i);
      if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
        controlCharCount++;
      }
    }

    // If more than 2% of checked chars are binary control characters, it's likely a binary file
    if (scanLimit > 100 && controlCharCount / scanLimit > 0.02) {
      return true;
    }

    return false;
  }

  private isTruncatedJson(content: string): boolean {
    const trimmed = content.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return true;
    }
    // If it doesn't end with matching braces/brackets, it's truncated
    if (trimmed.startsWith('{') && !trimmed.endsWith('}')) {
      return true;
    }
    if (trimmed.startsWith('[') && !trimmed.endsWith(']')) {
      return true;
    }
    return false;
  }
}

export const corruptionDetector = new CorruptionDetector();
