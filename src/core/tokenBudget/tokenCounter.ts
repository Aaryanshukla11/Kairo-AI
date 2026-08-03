export class TokenCounter {
  public count(text: string): number {
    if (!text) return 0;
    // Approximating tokens locally (4 chars per token)
    return Math.ceil(text.length / 4);
  }
}

export const tokenCounter = new TokenCounter();
