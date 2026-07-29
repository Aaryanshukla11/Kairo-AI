import { Memory, MemoryType } from './memoryTypes';

export class MemoryCompressor {
  /**
   * Compresses older Execution Summary items.
   * If there are many execution/history entries, compresses entries older than 7 days
   * or entries with low importance into consolidated summaries.
   */
  public compress(memories: Memory[]): { compressed: Memory[]; deletedIds: string[] } {
    const deletedIds: string[] = [];
    const executionMemories = memories.filter(
      m => m.type === MemoryType.ExecutionSummary && m.importance < 5
    );

    if (executionMemories.length <= 5) {
      return { compressed: [], deletedIds: [] };
    }

    const oldestDate = Math.min(...executionMemories.map(m => m.createdAt));
    const newestDate = Math.max(...executionMemories.map(m => m.createdAt));

    const totalTimeSpan = `${new Date(oldestDate).toLocaleDateString()} - ${new Date(newestDate).toLocaleDateString()}`;
    const titles = executionMemories.map(m => `- ${m.title} (${m.summary})`).join('\n');
    const contents = executionMemories.map(m => `### ${m.title}\n${m.content}`).join('\n\n');

    const compressedMemory: Memory = {
      id: `compressed-exec-${Date.now()}`,
      type: MemoryType.ExecutionSummary,
      title: `Consolidated Execution History (${totalTimeSpan})`,
      summary: `Automated consolidation of ${executionMemories.length} historical executions.`,
      content: `## Consumed Runs\n${titles}\n\n## Content Archive\n${contents}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      importance: 5,
      tags: ['consolidated', 'execution-history'],
      relatedFiles: Array.from(new Set(executionMemories.flatMap(m => m.relatedFiles || []))),
      relatedTasks: Array.from(new Set(executionMemories.flatMap(m => m.relatedTasks || []))),
      relatedCommits: Array.from(new Set(executionMemories.flatMap(m => m.relatedCommits || [])))
    };

    deletedIds.push(...executionMemories.map(m => m.id));

    return {
      compressed: [compressedMemory],
      deletedIds
    };
  }
}
