import { GenerationStrategy } from './generationTypes';

export class GenerationPlanner {
  public selectStrategy(plan: any): GenerationStrategy {
    const title = (plan.title || '').toLowerCase();
    
    if (title.includes('scaffold') || title.includes('setup')) {
      return GenerationStrategy.Scaffold;
    }
    if (title.includes('refactor') || title.includes('smell')) {
      return GenerationStrategy.Refactor;
    }
    if (title.includes('modify') || title.includes('update') || title.includes('change')) {
      return GenerationStrategy.ModifyExistingCode;
    }
    if (title.includes('boilerplate') || title.includes('stub')) {
      return GenerationStrategy.Boilerplate;
    }
    if (title.includes('config') || title.includes('package')) {
      return GenerationStrategy.Configuration;
    }
    if (title.includes('doc') || title.includes('readme')) {
      return GenerationStrategy.DocumentationStub;
    }

    return GenerationStrategy.CreateNewFeature;
  }
}

export const generationPlanner = new GenerationPlanner();
