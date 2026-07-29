import { RetrievedContext } from '../retriever/retrieverTypes';

export class PromptCompressor {
  /**
   * Removes duplicate elements and truncates sizes if budget thresholds are crossed.
   */
  public compress(context: RetrievedContext, charLimit: number): RetrievedContext {
    const uniqueFiles = new Map<string, any>();
    context.files.forEach(f => uniqueFiles.set(f.filePath, f));

    const uniqueSymbols = new Map<string, any>();
    context.symbols.forEach(s => uniqueSymbols.set(`${s.name}:${s.filePath}`, s));

    const files = Array.from(uniqueFiles.values());
    const symbols = Array.from(uniqueSymbols.values());

    let currentCharCount = files.reduce((acc, f) => acc + (f.size || 0), 0);
    const compressedFiles = [];
    
    for (const file of files) {
      if (currentCharCount > charLimit) {
        currentCharCount -= (file.size || 0);
        continue;
      }
      compressedFiles.push(file);
    }

    return {
      ...context,
      files: compressedFiles,
      symbols: symbols.slice(0, 5)
    };
  }
}

export const promptCompressor = new PromptCompressor();
