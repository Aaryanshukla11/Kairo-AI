export interface IGeneratorSession {
  readonly sessionId: string;
  readonly timestamp: number;
  readonly systemRole: string;
  readonly generationRules: readonly string[];
  readonly architectureRules: readonly string[];
  readonly codingStandards: {
    readonly languageConventions: string;
    readonly namingConventions: string;
    readonly formattingRules: string;
  };
  readonly outputContractSpecification: string;
  readonly requestPayload: {
    readonly requestId: string;
    readonly targetPlatform: string;
    readonly technologyStack: {
      readonly language: string;
      readonly frontend: string | null;
      readonly backend: string | null;
      readonly database: string | null;
    };
  };
  readonly promptDescription?: string;
  readonly conversationHistory?: readonly { role: 'user' | 'assistant'; text: string }[];
  readonly sourceCodeContext?: readonly { filePath: string; content: string }[];
  readonly metadata: {
    readonly estimatedTokenCount: number;
    readonly formatType: 'JSON_OUTPUT';
  };
}
