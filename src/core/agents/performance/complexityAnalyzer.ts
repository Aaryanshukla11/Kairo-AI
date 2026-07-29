import { ComplexityReport } from './performanceTypes';

export class ComplexityAnalyzer {
  public analyzeCode(filePath: string, content: string): ComplexityReport[] {
    const reports: ComplexityReport[] = [];
    const lines = content.split('\n');

    let inFunction = false;
    let currentSymbolName = 'anonymous';
    let loopNestingDepth = 0;
    let maxNesting = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match function declarations
      const funcMatch = trimmed.match(/(?:function\s+(\w+)|(\w+)\s*=\s*\([^)]*\)\s*=>)/);
      if (funcMatch) {
        if (inFunction) {
          // Output previous function complexity
          reports.push(this.buildReport(filePath, currentSymbolName, maxNesting));
        }
        inFunction = true;
        currentSymbolName = funcMatch[1] || funcMatch[2] || 'anonymous';
        loopNestingDepth = 0;
        maxNesting = 0;
      }

      // Check loops nested levels
      if (trimmed.startsWith('for ') || trimmed.startsWith('while ') || trimmed.includes('.forEach(') || trimmed.includes('.map(')) {
        loopNestingDepth++;
        if (loopNestingDepth > maxNesting) {
          maxNesting = loopNestingDepth;
        }
      }

      if (trimmed.includes('}') && loopNestingDepth > 0) {
        loopNestingDepth--;
      }
    }

    if (inFunction) {
      reports.push(this.buildReport(filePath, currentSymbolName, maxNesting));
    }

    // Default smoke check if no functions matched
    if (reports.length === 0) {
      reports.push({
        filePath,
        symbolName: 'main',
        estimatedComplexity: 'O(1)',
        reason: 'Constant time execution logic path.'
      });
    }

    return reports;
  }

  private buildReport(filePath: string, symbol: string, loopsDepth: number): ComplexityReport {
    let estimatedComplexity: 'O(1)' | 'O(N)' | 'O(N log N)' | 'O(N^2)' | 'O(2^N)' = 'O(1)';
    let reason = 'Constant execution profile without nesting loop statements.';

    if (loopsDepth === 1) {
      estimatedComplexity = 'O(N)';
      reason = 'Linear traversal over input collection datasets.';
    } else if (loopsDepth >= 2) {
      estimatedComplexity = 'O(N^2)';
      reason = 'Nested loop operations causing quadratic scale-up risks.';
    }

    return {
      filePath,
      symbolName: symbol,
      estimatedComplexity,
      reason
    };
  }
}

export const complexityAnalyzer = new ComplexityAnalyzer();
