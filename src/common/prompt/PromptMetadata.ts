export interface PromptMetadata {
  futureAttachments?: string[];
  futureContext?: Record<string, any>;
  futurePlannerOptions?: Record<string, any>;
  [key: string]: any;
}
