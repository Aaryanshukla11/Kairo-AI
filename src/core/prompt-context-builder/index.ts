import { builder } from './builder';
import { IPromptProcessorOutput } from '../prompt-processor/types';
import { IEntityExtractionOutput } from '../entity-extractor/types';
import { IProjectContextOutput } from '../project-context-analyzer/types';
import { IPromptContext } from './types';

export class PromptContextBuilder {
  public buildContext(
    processorOutput: IPromptProcessorOutput,
    extractorOutput: IEntityExtractionOutput,
    analyzerOutput: IProjectContextOutput
  ): IPromptContext {
    const context = builder.build(processorOutput, extractorOutput, analyzerOutput);
    return this.deepFreeze(context);
  }

  private deepFreeze<T>(obj: T): T {
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  }
}

export const promptContextBuilder = new PromptContextBuilder();
export default promptContextBuilder;
export * from './types';
export { PromptContextValidator } from './validator';
