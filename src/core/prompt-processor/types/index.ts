export type PromptIntent =
  | 'NEW_PROJECT'
  | 'MODIFY_PROJECT'
  | 'DEBUG_PROJECT'
  | 'EXPLAIN_CODE'
  | 'CHAT'
  | 'UNKNOWN';

export interface IPromptMetadata {
  readonly length: number;
  readonly lineCount: number;
  readonly hasMarkdown: boolean;
  readonly detectedTech: readonly string[];
}

export interface IPromptProcessorOutput {
  readonly id: string;
  readonly timestamp: number;
  readonly rawPrompt: string;
  readonly normalizedPrompt: string;
  readonly intent: PromptIntent;
  readonly confidence: number; // 0 to 1
  readonly metadata: IPromptMetadata;
}
