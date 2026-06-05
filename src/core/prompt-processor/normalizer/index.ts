export class PromptNormalizer {
  private normalizations: { pattern: RegExp; replacement: string }[] = [
    { pattern: /\b(reactjs|react js|react-js)\b/gi, replacement: 'React' },
    { pattern: /\bnode\b/gi, replacement: 'Node.js' },
    { pattern: /\bpostgres\b/gi, replacement: 'PostgreSQL' },
    { pattern: /\b(js|javascript)\b/gi, replacement: 'JavaScript' },
    { pattern: /\b(ts|typescript)\b/gi, replacement: 'TypeScript' },
    { pattern: /\bvuejs\b/gi, replacement: 'Vue.js' },
    { pattern: /\bnextjs\b/gi, replacement: 'Next.js' },
    { pattern: /\b(docker|dockerfile)\b/gi, replacement: 'Docker' },
    { pattern: /\b(mongodb|mongo)\b/gi, replacement: 'MongoDB' }
  ];

  public normalize(prompt: string): string {
    if (!prompt) return '';
    let normalized = prompt;

    for (const rule of this.normalizations) {
      normalized = normalized.replace(rule.pattern, rule.replacement);
    }

    return normalized;
  }
}

export const promptNormalizer = new PromptNormalizer();
export default promptNormalizer;
