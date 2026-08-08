import { promptParser } from './parser';
import { intentDetector } from './intent';
import { promptNormalizer } from './normalizer';
import { outputBuilder } from './builder';
import { logger } from './logger';
import { IPromptProcessorOutput } from './types';

export class PromptProcessor {
  public process(rawPrompt: string): IPromptProcessorOutput {
    logger.info(`Processing raw user prompt of length: ${rawPrompt?.length || 0}`);

    // 1. Parse raw prompt (trim, formatting, line normalization)
    const cleaned = promptParser.parse(rawPrompt);

    // 2. Normalization names
    const normalized = promptNormalizer.normalize(cleaned);

    // 3. Detect intent and calculate confidence
    const { intent, confidence } = intentDetector.detect(normalized);

    // 4. Output compilation builder
    const result = outputBuilder.build(rawPrompt, normalized, intent, confidence);

    logger.info(`Prompt processing completed successfully. Detected Intent: ${result.intent} (${result.confidence} confidence)`);
    return result;
  }
}

export const promptProcessor = new PromptProcessor();
export default promptProcessor;
export * from './types';
export { PromptParser } from './parser';
export { IntentDetector } from './intent';
export { PromptNormalizer } from './normalizer';
export { OutputBuilder } from './builder';
