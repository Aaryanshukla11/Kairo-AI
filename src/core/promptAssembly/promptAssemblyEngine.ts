import { PromptAssemblyRequest, PromptPackage, PromptAssemblyEventType } from './promptTypes';
import { promptValidator } from './promptValidator';
import { promptBuilder } from './promptBuilder';
import { PromptAssemblyEvents } from './promptEvents';
import { promptCache } from './promptCache';

export class PromptAssemblyEngine {
  private events = new PromptAssemblyEvents();

  /**
   * Subscribes a listener to Prompt Assembly changes.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  // --- API ---

  public assemblePrompt(request: PromptAssemblyRequest): PromptPackage {
    this.events.emit(PromptAssemblyEventType.PromptRequested, request.type);

    promptValidator.validateRequest(request);

    const cached = promptCache.get(request.prompt, request.type, request.retrievedContext);
    if (cached) {
      return cached;
    }

    const pkg = promptBuilder.build(request);
    this.events.emit(PromptAssemblyEventType.PromptBuilt, request.type, { pkg });

    promptValidator.validatePackage(pkg, request.tokenLimit || 100000);
    this.events.emit(PromptAssemblyEventType.PromptValidated, request.type);

    promptCache.set(request.prompt, request.type, request.retrievedContext, pkg);

    return pkg;
  }

  public invalidateCache(): void {
    promptCache.invalidate();
  }
}
