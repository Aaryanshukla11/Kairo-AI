import { CollectedFileItem, CleaningRulesConfig } from './cleaningTypes';
import { corruptionDetector } from './corruptionDetector';

export class InvalidSampleDetector {
  public detectInvalidSample(
    sample: CollectedFileItem,
    config: CleaningRulesConfig
  ): { isInvalid: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (!sample) {
      return { isInvalid: true, reasons: ['Sample is empty or null.'] };
    }

    const content = sample.content;
    const provenance = sample.provenance;

    // 1. Unreadable Check
    if (config.rejectUnreadable && (content === null || content === undefined)) {
      reasons.push('File is unreadable.');
      return { isInvalid: true, reasons };
    }

    // 2. Empty Sample Check
    if (config.rejectEmptySamples && (!content || content.trim().length === 0)) {
      reasons.push('Sample is empty.');
    }

    // 3. Corruption Check
    if (config.rejectCorrupted) {
      const corruptionRes = corruptionDetector.detectCorruption(sample);
      if (corruptionRes.isCorrupted) {
        reasons.push(...corruptionRes.reasons);
      }
    }

    // 4. Missing Metadata Check
    if (config.rejectMissingMetadata) {
      if (!provenance) {
        reasons.push('Missing entire provenance metadata.');
      } else {
        if (!provenance.sampleId) reasons.push('Missing sampleId.');
        if (!provenance.datasetId) reasons.push('Missing datasetId.');
        if (!provenance.filePath) reasons.push('Missing filePath.');
        if (!provenance.checksum) reasons.push('Missing checksum.');
      }
    }

    // 5. Unsupported Formats Check
    if (config.rejectUnsupportedFormats) {
      const ext = (sample.filePath || '').split('.').pop()?.toLowerCase();
      const supportedExtensions = [
        'ts', 'tsx', 'js', 'jsx', 'cjs', 'mjs',
        'py', 'java', 'cpp', 'c', 'h', 'hpp', 'cs',
        'go', 'rs', 'php', 'rb', 'swift', 'kt',
        'sh', 'sql', 'json', 'jsonl', 'md', 'markdown',
        'txt', 'rst', 'adoc'
      ];
      if (!ext || !supportedExtensions.includes(ext)) {
        reasons.push(`Unsupported file extension: .${ext || 'unknown'}`);
      }
    }

    return {
      isInvalid: reasons.length > 0,
      reasons
    };
  }
}

export const invalidSampleDetector = new InvalidSampleDetector();
