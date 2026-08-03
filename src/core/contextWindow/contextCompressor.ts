import { ContextItem, ContextCompressionReport } from './contextTypes';

export class ContextCompressor {
  public compressItem(item: ContextItem): { item: ContextItem; report: ContextCompressionReport } {
    const originalTokens = item.tokenCount;
    
    // Simple compression: remove duplicate blank lines, trim whitespaces, remove comments
    let compressedContent = item.content
      .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '') // Remove JS comments
      .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
      .replace(/[ \t]+/g, ' ') // Collapse multiple spaces
      .trim();

    const compressedTokens = Math.max(1, Math.ceil(compressedContent.length / 4));
    const ratio = originalTokens > 0 ? compressedTokens / originalTokens : 1.0;

    return {
      item: {
        ...item,
        content: compressedContent,
        tokenCount: compressedTokens
      },
      report: {
        originalTokens,
        compressedTokens,
        ratio: parseFloat(ratio.toFixed(2)),
        technique: 'Whitespace & Comments Stripping'
      }
    };
  }

  public compressList(items: ContextItem[]): { items: ContextItem[]; report: ContextCompressionReport } {
    let totalOriginal = 0;
    let totalCompressed = 0;
    const compressedList: ContextItem[] = [];

    for (const item of items) {
      totalOriginal += item.tokenCount;
      if (item.priority !== 'Critical' && item.content.length > 500) {
        const { item: compressed } = this.compressItem(item);
        totalCompressed += compressed.tokenCount;
        compressedList.push(compressed);
      } else {
        totalCompressed += item.tokenCount;
        compressedList.push(item);
      }
    }

    const ratio = totalOriginal > 0 ? totalCompressed / totalOriginal : 1.0;

    return {
      items: compressedList,
      report: {
        originalTokens: totalOriginal,
        compressedTokens: totalCompressed,
        ratio: parseFloat(ratio.toFixed(2)),
        technique: 'Selective Whitespace & Comments Stripping'
      }
    };
  }
}

export const contextCompressor = new ContextCompressor();
