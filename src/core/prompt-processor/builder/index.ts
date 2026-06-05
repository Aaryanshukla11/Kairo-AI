import { IPromptProcessorOutput, PromptIntent, IPromptMetadata } from '../types';
import * as crypto from 'crypto';

export class OutputBuilder {
  public build(
    rawPrompt: string,
    normalizedPrompt: string,
    intent: PromptIntent,
    confidence: number
  ): IPromptProcessorOutput {
    const id = crypto.randomUUID ? crypto.randomUUID() : `prompt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();

    // Compile metadata properties
    const hasMarkdown = rawPrompt.includes('```');
    const lineCount = rawPrompt.split('\n').length;
    const length = rawPrompt.length;

    // Detect technical keywords
    const techKeywords = ['React', 'Node.js', 'PostgreSQL', 'Docker', 'MongoDB', 'Vue.js', 'Next.js', 'JavaScript', 'TypeScript'];
    const detected: string[] = [];
    const normalizedLower = normalizedPrompt.toLowerCase();

    for (const tech of techKeywords) {
      if (normalizedLower.includes(tech.toLowerCase())) {
        detected.push(tech);
      }
    }

    const metadata: IPromptMetadata = Object.freeze({
      length,
      lineCount,
      hasMarkdown,
      detectedTech: Object.freeze(detected)
    });

    const output: IPromptProcessorOutput = {
      id,
      timestamp,
      rawPrompt,
      normalizedPrompt,
      intent,
      confidence,
      metadata
    };

    return Object.freeze(output);
  }
}

export const outputBuilder = new OutputBuilder();
export default outputBuilder;
