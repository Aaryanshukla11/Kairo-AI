import { PromptOptimizationReport } from './promptTypes';

export class PromptOptimizer {
  public optimize(prompt: string): { optimized: string; report: PromptOptimizationReport } {
    let removedDuplicates = 0;
    let mergedContexts = 0;
    const notes: string[] = [];

    // Remove repeated sequential spaces or lines
    let optimized = prompt.replace(/\n{3,}/g, '\n\n');
    
    // Check duplicate headers e.g. duplicate System Instructions or user requests
    const split = optimized.split('\n');
    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (const line of split) {
      if (line.startsWith('=== SOURCE:') && seen.has(line)) {
        removedDuplicates++;
        mergedContexts++;
        continue;
      }
      if (line.startsWith('=== SOURCE:')) {
        seen.add(line);
      }
      uniqueLines.push(line);
    }

    optimized = uniqueLines.join('\n');
    notes.push(`Optimized whitespace gaps.`);
    if (removedDuplicates > 0) {
      notes.push(`Removed ${removedDuplicates} duplicate context blocks.`);
    }

    return {
      optimized,
      report: {
        removedDuplicates,
        mergedContexts,
        formattedOk: true,
        notes
      }
    };
  }
}

export const promptOptimizer = new PromptOptimizer();
