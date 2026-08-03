import { compilerEngine } from './compilerEngine';
import { promptEvents } from './promptEvents';
import { promptHistory } from './promptHistory';
import { promptCache } from './promptCache';
import { PromptRequest, CompiledPromptResult, PromptReport } from './promptTypes';

export class PromptCompiler {
  public async compile(request: PromptRequest, tokenLimit = 32768): Promise<CompiledPromptResult> {
    const cacheKey = JSON.stringify({ type: request.type, prompt: request.userPrompt });
    const cached = promptCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    return compilerEngine.compile(request, tokenLimit);
  }

  public getHistory(): PromptReport[] {
    return promptHistory.getHistory();
  }

  public clearCache(): void {
    promptCache.clear();
    promptHistory.clear();
  }

  public subscribe(listener: any): () => void {
    return promptEvents.subscribe(listener);
  }
}

export const promptCompiler = new PromptCompiler();
