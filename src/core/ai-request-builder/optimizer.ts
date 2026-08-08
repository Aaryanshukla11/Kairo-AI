import { IPriorityRequirement } from './types';

export class TokenOptimizer {
  public optimizeRequirements(requirements: IPriorityRequirement[]): IPriorityRequirement[] {
    const seen = new Set<string>();
    const optimized: IPriorityRequirement[] = [];

    for (const req of requirements) {
      const key = `${req.category}:${req.name.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        optimized.push(req);
      }
    }

    // Sort by priority so that critical models are read first (CRITICAL -> HIGH -> MEDIUM -> LOW)
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    optimized.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return optimized;
  }
}

export const tokenOptimizer = new TokenOptimizer();
export default tokenOptimizer;
