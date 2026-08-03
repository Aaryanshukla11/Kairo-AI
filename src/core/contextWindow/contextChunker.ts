export class ContextChunker {
  public chunkText(text: string, maxTokensPerChunk = 1000): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentTokens = 0;

    for (const word of words) {
      const approxTokens = Math.ceil(word.length / 4) + 1;
      if (currentTokens + approxTokens > maxTokensPerChunk) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [word];
        currentTokens = approxTokens;
      } else {
        currentChunk.push(word);
        currentTokens += approxTokens;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks;
  }
}

export const contextChunker = new ContextChunker();
