import { ParsedStackFrame } from './stackTraceAnalyzer';

export interface RootCauseResolution {
  probableCause: string;
  affectedComponents: string[];
  relatedFiles: string[];
}

export class RootCauseEngine {
  public resolve(
    errorName: string,
    message: string,
    stackFrames: ParsedStackFrame[]
  ): RootCauseResolution {
    const affectedComponents: string[] = [];
    const relatedFiles: string[] = [];
    let probableCause = `Unhandled ${errorName}: ${message}`;

    if (stackFrames && stackFrames.length > 0) {
      const targetFrame = stackFrames[0];
      probableCause = `Exception triggered in function "${targetFrame.methodName}" at line ${targetFrame.line} inside file ${targetFrame.filePath}. Details: ${message}`;
      
      for (const frame of stackFrames) {
        relatedFiles.push(frame.filePath);
        if (frame.filePath.includes('src/core/')) {
          affectedComponents.push('Core Agent Runtime');
        } else if (frame.filePath.includes('src/webview/')) {
          affectedComponents.push('Webview UI Dashboard Panel');
        }
      }
    }

    if (affectedComponents.length === 0) {
      affectedComponents.push('General Utilities');
    }

    return {
      probableCause,
      affectedComponents: Array.from(new Set(affectedComponents)),
      relatedFiles: Array.from(new Set(relatedFiles))
    };
  }
}

export const rootCauseEngine = new RootCauseEngine();
