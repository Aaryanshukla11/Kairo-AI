export interface IPromptContext {
  readonly id: string;
  readonly timestamp: number;
  readonly rawPrompt: string;
  readonly normalizedPrompt: string;
  readonly intent: string;
  readonly confidence: number;
  readonly projectInfo: {
    readonly name: string | null;
    readonly type: string;
  };
  readonly workspaceInfo: {
    readonly isEmpty: boolean;
    readonly isProjectPresent: boolean;
    readonly isMonorepo: boolean;
    readonly hasGit: boolean;
  };
  readonly detectedTechnologies: {
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
  readonly detectedFeatures: readonly string[];
  readonly existingFiles: readonly string[];
  readonly dependencies: Readonly<Record<string, string>>;
  readonly warnings: readonly string[];
  readonly metadata: {
    readonly length: number;
    readonly lineCount: number;
    readonly hasMarkdown: boolean;
  };
}
