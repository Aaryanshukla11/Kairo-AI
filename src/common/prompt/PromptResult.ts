export interface PromptResult {
  status: 'SUCCESS' | 'ERROR';
  accepted: boolean;
  promptId: string;
  processingTime: number;
  errors?: string[];
}
