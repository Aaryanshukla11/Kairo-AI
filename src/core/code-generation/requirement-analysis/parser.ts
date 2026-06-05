export class PromptParser {
  public parse(prompt: string): {
    raw: string;
    cleaned: string;
    sentences: string[];
    tokens: string[];
  } {
    const cleaned = prompt.trim().replace(/\s+/g, ' ');
    const sentences = cleaned.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const tokens = cleaned.toLowerCase().split(/[\s,.:;?!()"'`]+/).filter(Boolean);

    return {
      raw: prompt,
      cleaned,
      sentences,
      tokens
    };
  }
}

export const promptParser = new PromptParser();
