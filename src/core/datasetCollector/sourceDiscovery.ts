import { SourceInfo, SourceReport } from './collectorTypes';
import * as path from 'path';

export class SourceDiscovery {
  public discover(sourcePaths: string[]): SourceInfo[] {
    const results: SourceInfo[] = [];

    for (const rawPath of sourcePaths) {
      if (!rawPath || rawPath.trim().length === 0) {
        continue;
      }

      const trimmed = rawPath.trim();
      const sourceType = this.inferSourceType(trimmed);

      results.push({
        path: trimmed,
        type: sourceType,
        isReachable: true
      });
    }

    return results;
  }

  public inferSourceType(sourcePath: string): string {
    const lower = sourcePath.toLowerCase();
    if (lower.startsWith('github.com/') || lower.startsWith('https://github.com/') || lower.endsWith('.git')) {
      return 'Git Repository';
    }
    if (lower.includes('archive') || lower.endsWith('.zip') || lower.endsWith('.tar.gz')) {
      return 'GitHub Archive';
    }
    if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
      return 'Markdown Document';
    }
    if (lower.endsWith('.json') || lower.endsWith('.jsonl')) {
      return 'JSON Dataset';
    }
    if (lower.includes('/docs') || lower.includes('/documentation')) {
      return 'Documentation';
    }
    return 'Local Folder';
  }

  public generateSourceReport(sources: SourceInfo[]): SourceReport {
    const totalSources = sources.length;
    const reachableSources = sources.filter(s => s.isReachable).length;
    const unreachableSources = totalSources - reachableSources;

    return {
      timestamp: Date.now(),
      totalSources,
      reachableSources,
      unreachableSources,
      sources
    };
  }
}

export const sourceDiscovery = new SourceDiscovery();
