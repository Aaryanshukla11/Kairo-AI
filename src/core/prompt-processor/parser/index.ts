export class PromptParser {
  public parse(rawPrompt: string): string {
    if (!rawPrompt) return '';
    
    // Normalize newlines to LF
    let clean = rawPrompt.replace(/\r\n/g, '\n');
    
    // Split into lines, trim each, and join back
    const lines = clean.split('\n').map(line => line.trim());
    
    // Rejoin lines while removing excessive multiple blank lines (keep max one blank line consecutive)
    const resultLines: string[] = [];
    let blankCount = 0;
    
    for (const line of lines) {
      if (line === '') {
        blankCount++;
        if (blankCount <= 1) {
          resultLines.push(line);
        }
      } else {
        blankCount = 0;
        resultLines.push(line);
      }
    }
    
    clean = resultLines.join('\n').trim();
    return clean;
  }
}

export const promptParser = new PromptParser();
export default promptParser;
