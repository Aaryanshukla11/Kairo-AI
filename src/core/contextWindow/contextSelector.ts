import { ContextItem, ContextPriority } from './contextTypes';

export class ContextSelector {
  public selectBudget(items: ContextItem[], tokenLimit: number): ContextItem[] {
    const selected: ContextItem[] = [];
    let currentTokens = 0;

    // First sort by priority order: Critical, High, Medium, Low, Background
    const priorityOrder = {
      [ContextPriority.Critical]: 0,
      [ContextPriority.High]: 1,
      [ContextPriority.Medium]: 2,
      [ContextPriority.Low]: 3,
      [ContextPriority.Background]: 4
    };

    const sorted = [...items].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    for (const item of sorted) {
      if (currentTokens + item.tokenCount <= tokenLimit) {
        selected.push(item);
        currentTokens += item.tokenCount;
      } else if (item.priority === ContextPriority.Critical) {
        // Force include critical, maybe partial content
        const truncatedContent = item.content.substring(0, (tokenLimit - currentTokens) * 4);
        const tokens = Math.ceil(truncatedContent.length / 4);
        
        if (tokens > 0) {
          selected.push({
            ...item,
            content: truncatedContent,
            tokenCount: tokens
          });
          currentTokens += tokens;
        }
      }
    }

    return selected;
  }
}

export const contextSelector = new ContextSelector();
