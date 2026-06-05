import { Prompt } from '../../common/prompt';
import { PromptValidator } from '../../common/prompt';
import { PromptResult } from '../../common/prompt';
import { aiKernel } from '../../core/ai-kernel';

export class PromptPipeline {
  /**
   * Processes an incoming prompt through validation and AI Kernel execution stages.
   * Returns prompt result containing AI Kernel compilation status.
   */
  public async process(prompt: Prompt): Promise<PromptResult> {
    const startTime = Date.now();

    // 1. Validation Layer
    const validation = PromptValidator.validate(prompt);
    
    if (!validation.valid) {
      return {
        status: 'ERROR',
        accepted: false,
        promptId: prompt.id,
        processingTime: Date.now() - startTime,
        errors: validation.errors
      };
    }

    // 2. AI Kernel Runtime Execution (Single Entry Point for Prompts)
    try {
      const compiledRequest = await aiKernel.processPrompt({
        rawPrompt: prompt.rawPrompt,
        requestId: prompt.id
      });

      return {
        status: 'SUCCESS',
        accepted: true,
        promptId: prompt.id,
        processingTime: Date.now() - startTime,
        data: {
          intent: compiledRequest.intent,
          selectedModel: compiledRequest.routingDecision.selectedModel,
          memoriesCount: compiledRequest.memories.length,
          knowledgeFilesCount: compiledRequest.knowledge.indexedFiles.length
        }
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        accepted: false,
        promptId: prompt.id,
        processingTime: Date.now() - startTime,
        errors: [err.message || String(err)]
      };
    }
  }
}

