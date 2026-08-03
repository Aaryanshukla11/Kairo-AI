import { PromptCompressionReport } from './promptTypes';

export class PromptCompressor {
  public compress(prompt: string): { compressed: string; report: PromptCompressionReport } {
    const originalTokens = Math.ceil(prompt.length / 4);

    // Compress blank lines and redundant spaces
    const compressed = prompt
      .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
      .replace(/[ \t]+/g, ' ') // Collapse multiple spaces
      .trim();

    const compressedTokens = Math.max(1, Math.ceil(compressed.length / 4));
    const ratio = originalTokens > 0 ? compressedTokens / originalTokens : 1.0;

    return {
      compressed,
      report: {
        originalTokens,
        compressedTokens,
        ratio: parseFloat(ratio.toFixed(2))
      }
    };
  }
}

export const promptCompressor = new PromptCompressor();
