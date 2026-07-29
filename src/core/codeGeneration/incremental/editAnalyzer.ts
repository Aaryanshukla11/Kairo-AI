export class EditAnalyzer {
  public analyzeContext(content: string, start: number, end: number): string {
    const contextStart = Math.max(0, start - 50);
    const contextEnd = Math.min(content.length, end + 50);
    return content.substring(contextStart, contextEnd);
  }
}

export const editAnalyzer = new EditAnalyzer();
