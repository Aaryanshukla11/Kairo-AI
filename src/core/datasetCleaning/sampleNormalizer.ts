import { CollectedFileItem } from '../datasetCollector/collectorTypes';
import { encodingNormalizer } from './encodingNormalizer';
import { whitespaceNormalizer } from './whitespaceNormalizer';
import { languageNormalizer } from './languageNormalizer';
import { metadataNormalizer } from './metadataNormalizer';

export interface NormalizationResult {
  content: string;
  provenance: any;
  normalizationsApplied: string[];
}

export class SampleNormalizer {
  public normalizeSample(sample: CollectedFileItem): NormalizationResult {
    const normalizationsApplied: string[] = [];
    let currentContent = sample.content || '';
    let currentProvenance = { ...sample.provenance };

    // 1. Normalize encoding (NFC Unicode)
    const encodingRes = encodingNormalizer.normalizeEncoding(currentContent);
    currentContent = encodingRes.normalized;
    if (encodingRes.isModified) {
      normalizationsApplied.push('UTF-8 NFC Normalization');
    }

    // 2. Normalize whitespace and line endings
    const whitespaceRes = whitespaceNormalizer.normalizeWhitespace(currentContent);
    currentContent = whitespaceRes.normalized;
    if (whitespaceRes.isModified) {
      normalizationsApplied.push('Whitespace & Line Ending Normalization');
    }

    // 3. Normalize Language
    const languageRes = languageNormalizer.normalizeLanguage(
      currentProvenance.language || '',
      sample.filePath || ''
    );
    currentProvenance.language = languageRes.normalized;
    if (languageRes.isModified) {
      normalizationsApplied.push('Language Naming Normalization');
    }

    // 4. Normalize Metadata (paths, branches, formats)
    const metadataRes = metadataNormalizer.normalizeMetadata(currentProvenance);
    currentProvenance = metadataRes.normalized;
    if (metadataRes.isModified) {
      normalizationsApplied.push('Metadata Fields & Path Normalization');
    }

    return {
      content: currentContent,
      provenance: currentProvenance,
      normalizationsApplied
    };
  }
}

export const sampleNormalizer = new SampleNormalizer();
