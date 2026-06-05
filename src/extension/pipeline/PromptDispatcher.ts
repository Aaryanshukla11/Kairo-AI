import { Prompt } from '../../common/prompt';
import { PromptPipeline } from './PromptPipeline';
import { PromptResult } from '../../common/prompt';

export class PromptDispatcher {
  private pipeline: PromptPipeline;

  constructor() {
    this.pipeline = new PromptPipeline();
  }

  /**
   * Receives incoming prompt structures from the MessageRouter and routes them
   * into the PromptPipeline asynchronously.
   */
  public async dispatch(promptPayload: any): Promise<PromptResult> {
    // Note: The payload is passed as any because it was deserialized from IPC.
    // The PromptValidator will enforce the schema inside the pipeline.
    const prompt = promptPayload as Prompt;
    return await this.pipeline.process(prompt);
  }
}
