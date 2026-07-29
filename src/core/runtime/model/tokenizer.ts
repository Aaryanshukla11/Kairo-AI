export class Tokenizer {
  /**
   * Estimates tokens based on character length.
   */
  public countTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Deconstructs string into array tokens.
   */
  public tokenize(text: string): string[] {
    if (!text) return [];
    const tokens: string[] = [];
    for (let i = 0; i < text.length; i += 4) {
      tokens.push(text.slice(i, i + 4));
    }
    return tokens;
  }
}

export const tokenizer = new Tokenizer();
