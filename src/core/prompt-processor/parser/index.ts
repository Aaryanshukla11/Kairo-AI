import { logKairoStage } from '../../../common/kairoLogger';

export class PromptParser {
  public parse(rawPrompt: string): string {
    const executionId = `parse-${Date.now()}`;
    const startTime = Date.now();
    logKairoStage('Parser', 'ENTER', executionId, { promptLength: rawPrompt?.length || 0 });

    try {
      if (!rawPrompt) {
        logKairoStage('Parser', 'EXIT', executionId, { promptLength: 0 }, { cleanLength: 0 }, 0);
        return '';
      }
      
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
      const duration = Date.now() - startTime;
      logKairoStage('Parser', 'EXIT', executionId, { promptLength: rawPrompt.length }, { cleanLength: clean.length }, duration);
      return clean;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logKairoStage('Parser', 'ERROR', executionId, { promptLength: rawPrompt?.length || 0 }, null, duration, error);
      throw error;
    }
  }
}

export const promptParser = new PromptParser();
export default promptParser;
