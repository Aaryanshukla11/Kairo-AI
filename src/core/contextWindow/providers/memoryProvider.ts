import { ContextItem, ContextPriority } from '../contextTypes';

export class MemoryProvider {
  public collect(memories: any[]): ContextItem[] {
    return memories.map((mem, idx) => ({
      id: `mem-${idx}`,
      source: 'memory',
      content: `Memory: ${mem.content || mem}`,
      tokenCount: 10,
      priority: ContextPriority.Low,
      score: 0.3
    }));
  }
}
