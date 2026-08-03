export class EncodingNormalizer {
  public normalizeEncoding(content: string): { normalized: string; isModified: boolean; detectedEncoding: string } {
    if (!content) {
      return { normalized: '', isModified: false, detectedEncoding: 'UTF-8' };
    }

    // JS strings are UTF-16, but we can normalize to Unicode Normalization Form C (NFC)
    const normalized = content.normalize('NFC');
    const isModified = normalized !== content;

    return {
      normalized,
      isModified,
      detectedEncoding: 'UTF-8'
    };
  }

  public isCorruptedEncoding(content: string): boolean {
    if (!content) return false;
    // Check for replacement character \uFFFD which represents unrecognized characters/encoding errors
    const replacementCharCount = (content.match(/\uFFFD/g) || []).length;
    // If more than 0.5% of characters are replacement chars, we flag it as corrupted
    if (content.length > 100 && replacementCharCount / content.length > 0.005) {
      return true;
    }
    return false;
  }
}

export const encodingNormalizer = new EncodingNormalizer();
