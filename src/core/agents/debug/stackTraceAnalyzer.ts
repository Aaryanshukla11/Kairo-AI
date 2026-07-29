export interface ParsedStackFrame {
  methodName: string;
  filePath: string;
  line: number;
  column: number;
}

export class StackTraceAnalyzer {
  public parse(stack: string): ParsedStackFrame[] {
    const frames: ParsedStackFrame[] = [];
    if (!stack) return frames;

    const lines = stack.split('\n');
    const frameRegex = /at\s+([^\s\(]+)?\s*\(?([^:]+):(\d+):(\d+)\)?/;

    for (const line of lines) {
      const match = line.match(frameRegex);
      if (match) {
        frames.push({
          methodName: match[1] || 'anonymous',
          filePath: match[2],
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10)
        });
      }
    }

    return frames;
  }
}

export const stackTraceAnalyzer = new StackTraceAnalyzer();
