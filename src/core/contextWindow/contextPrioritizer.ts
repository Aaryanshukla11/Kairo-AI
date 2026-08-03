import { ContextItem, ContextPriority } from './contextTypes';

export class ContextPrioritizer {
  public prioritize(items: ContextItem[]): ContextItem[] {
    return items.map(item => {
      let priority = ContextPriority.Medium;

      if (item.source === 'system' || item.source === 'user') {
        priority = ContextPriority.Critical;
      } else if (item.score >= 0.8 || item.source === 'diagnostics') {
        priority = ContextPriority.High;
      } else if (item.score < 0.3) {
        priority = ContextPriority.Low;
      } else if (item.source === 'background') {
        priority = ContextPriority.Background;
      }

      return {
        ...item,
        priority
      };
    });
  }
}

export const contextPrioritizer = new ContextPrioritizer();
