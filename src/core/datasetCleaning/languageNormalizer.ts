export class LanguageNormalizer {
  public normalizeLanguage(language: string, filePath: string): { normalized: string; isModified: boolean } {
    const rawLang = (language || '').trim().toLowerCase();
    const ext = filePath.split('.').pop()?.toLowerCase() || '';

    let normalized = language;

    if (rawLang === 'typescript' || rawLang === 'ts' || rawLang === 'tsx') {
      normalized = 'TypeScript';
    } else if (rawLang === 'javascript' || rawLang === 'js' || rawLang === 'jsx' || rawLang === 'node') {
      normalized = 'JavaScript';
    } else if (rawLang === 'python' || rawLang === 'py') {
      normalized = 'Python';
    } else if (rawLang === 'markdown' || rawLang === 'md' || rawLang === 'mdx') {
      normalized = 'Markdown';
    } else if (rawLang === 'json' || rawLang === 'jsonl') {
      normalized = 'JSON';
    } else if (rawLang === 'cpp' || rawLang === 'c++' || rawLang === 'cc') {
      normalized = 'C++';
    } else if (rawLang === 'c') {
      normalized = 'C';
    } else if (rawLang === 'rust' || rawLang === 'rs') {
      normalized = 'Rust';
    } else if (rawLang === 'go' || rawLang === 'golang') {
      normalized = 'Go';
    } else {
      // Try to infer from extension if unknown
      normalized = this.inferFromExtension(ext) || language || 'Unknown';
    }

    return {
      normalized,
      isModified: normalized !== language
    };
  }

  private inferFromExtension(ext: string): string | null {
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'TypeScript';
      case 'js':
      case 'jsx':
        return 'JavaScript';
      case 'py':
        return 'Python';
      case 'md':
      case 'markdown':
        return 'Markdown';
      case 'json':
        return 'JSON';
      case 'cpp':
      case 'cc':
        return 'C++';
      case 'go':
        return 'Go';
      case 'rs':
        return 'Rust';
      default:
        return null;
    }
  }
}

export const languageNormalizer = new LanguageNormalizer();
