import { TaskGenerationInput } from './taskTypes';

export interface MilestoneAnalysis {
  milestoneId: string;
  name: string;
  description: string;
  detectedTypes: Array<'UI Task' | 'Backend Task' | 'API Task' | 'Database Task' | 'Testing Task' | 'Configuration Task'>;
  suggestedFiles: string[];
}

export class TaskAnalyzer {
  public analyzeMilestones(input: TaskGenerationInput): MilestoneAnalysis[] {
    const results: MilestoneAnalysis[] = [];

    for (const ms of input.featurePlan.milestones) {
      const text = `${ms.name} ${ms.description} ${(ms.requirements || []).join(' ')}`.toLowerCase();
      const detectedTypes: MilestoneAnalysis['detectedTypes'] = [];

      if (text.includes('ui') || text.includes('component') || text.includes('view') || text.includes('frontend') || text.includes('dashboard')) {
        detectedTypes.push('UI Task');
      }
      if (text.includes('api') || text.includes('endpoint') || text.includes('route') || text.includes('request')) {
        detectedTypes.push('API Task');
      }
      if (text.includes('db') || text.includes('database') || text.includes('schema') || text.includes('table') || text.includes('model')) {
        detectedTypes.push('Database Task');
      }
      if (text.includes('backend') || text.includes('service') || text.includes('logic') || text.includes('core') || text.includes('engine')) {
        detectedTypes.push('Backend Task');
      }
      if (text.includes('test') || text.includes('spec') || text.includes('verify') || text.includes('unit')) {
        detectedTypes.push('Testing Task');
      }

      if (detectedTypes.length === 0) {
        detectedTypes.push('Backend Task');
      }

      // Always include testing task for completeness
      if (!detectedTypes.includes('Testing Task')) {
        detectedTypes.push('Testing Task');
      }

      results.push({
        milestoneId: ms.milestoneId,
        name: ms.name,
        description: ms.description,
        detectedTypes,
        suggestedFiles: ms.filesToTouch || []
      });
    }

    return results;
  }
}
export const taskAnalyzer = new TaskAnalyzer();
