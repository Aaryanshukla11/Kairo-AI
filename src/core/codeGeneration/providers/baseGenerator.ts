import { GeneratedFile, GenerationContext, GenerationStrategy } from '../generationTypes';

export abstract class BaseGenerator {
  public abstract generate(
    context: GenerationContext,
    strategy: GenerationStrategy,
    plan: any
  ): Promise<GeneratedFile[]>;
}
