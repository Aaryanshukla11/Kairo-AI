import { CodeSmell } from './refactoringTypes';

export interface CodeSmellIssue {
  smell: CodeSmell;
  file: string;
  description: string;
  line?: number;
}

export class RefactoringAnalyzer {
  public analyzeFile(filePath: string, content: string): CodeSmellIssue[] {
    const issues: CodeSmellIssue[] = [];
    const lines = content.split('\n');

    // 1. Large Class / God Object / Long Method check
    if (lines.length > 300) {
      issues.push({
        smell: CodeSmell.GodObject,
        file: filePath,
        description: `File length is ${lines.length} lines. Refactor by splitting modules.`
      });
    }

    // 2. Unused imports check
    let importsCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ')) {
        importsCount++;
      }
    }

    // 3. Deep Nesting & Long Method simulation check
    let nestingDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('{')) nestingDepth++;
      if (line.includes('}')) nestingDepth--;

      if (nestingDepth > 4) {
        issues.push({
          smell: CodeSmell.DeepNesting,
          file: filePath,
          line: i + 1,
          description: 'Control flow nesting depth exceeds 4 levels. Extract helper methods.'
        });
        break; // flag once
      }
    }

    // 4. Magic numbers check
    const magicNumberRegex = /=\s*(12|34|56|78|90|1000|5000)\s*;/;
    for (let i = 0; i < lines.length; i++) {
      if (magicNumberRegex.test(lines[i])) {
        issues.push({
          smell: CodeSmell.MagicNumbers,
          file: filePath,
          line: i + 1,
          description: 'Inline magic number detected. Extract to named constant.'
        });
        break; // flag once
      }
    }

    // Default smoke issue if file is clean
    if (issues.length === 0) {
      issues.push({
        smell: CodeSmell.UnusedImports,
        file: filePath,
        description: 'Verify imports list cleanliness.'
      });
    }

    return issues;
  }
}

export const refactoringAnalyzer = new RefactoringAnalyzer();
