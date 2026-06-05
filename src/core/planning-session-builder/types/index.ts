export interface IPlanningSession {
  readonly sessionId: string;
  readonly timestamp: number;
  readonly systemInstructions: string;
  readonly injectedRules: readonly string[];
  readonly context: {
    readonly project: {
      readonly name: string | null;
      readonly type: string;
    };
    readonly workspace: {
      readonly isEmpty: boolean;
      readonly isProjectPresent: boolean;
      readonly isMonorepo: boolean;
      readonly hasGit: boolean;
    };
    readonly stack: {
      readonly language: string | null;
      readonly frontend: string | null;
      readonly backend: string | null;
      readonly database: string | null;
      readonly authMethod: string | null;
      readonly apiStyle: string | null;
      readonly uiFramework: string | null;
      readonly cssFramework: string | null;
      readonly stateManagement: string | null;
      readonly buildTool: string | null;
    };
  };
  readonly outputSchemaSpecification: string;
  readonly userPromptPayload: string;
  readonly metadata: {
    readonly estimatedTokenCount: number;
    readonly formatType: 'JSON_SCHEMA';
  };
}
