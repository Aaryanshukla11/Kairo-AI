export class TokenizerAdapter {
  public encode(text: string): number[] {
    // Return array of simulated token IDs
    return Array.from({ length: Math.ceil(text.length / 4) }, (_, i) => i);
  }
}
