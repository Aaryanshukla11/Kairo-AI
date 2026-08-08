import { generationOrchestrator } from './orchestrator';
import { IDevelopmentRequest } from '../planning-validator-handoff/types';
import { ICodingModelProvider } from '../coding-runtime/types';
import { IGenerationResult } from './types';

export class CodeGenerationPipeline {
  public async generateCode(
    request: IDevelopmentRequest,
    provider: ICodingModelProvider,
    onProgress?: (moduleName: string, progress: number) => void,
    workspacePath?: string
  ): Promise<IGenerationResult> {
    const result = await generationOrchestrator.executePipeline(request, provider, onProgress, workspacePath);
    return this.deepFreeze(result);
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

export const codeGenerationPipeline = new CodeGenerationPipeline();
export default codeGenerationPipeline;
export * from './types';
export { GenerationOrchestrator } from './orchestrator';
