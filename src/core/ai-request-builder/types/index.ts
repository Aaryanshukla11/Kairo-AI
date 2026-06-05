export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface IPriorityRequirement {
  readonly name: string;
  readonly category: 'feature' | 'integration' | 'technology';
  readonly priority: PriorityLevel;
}

export interface IAIRequestOutput {
  readonly requestId: string;
  readonly timestamp: number;
  readonly prompt: string;
  readonly intent: string;
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
  readonly requirements: readonly IPriorityRequirement[];
  readonly metadata: {
    readonly length: number;
    readonly lineCount: number;
    readonly hasMarkdown: boolean;
  };
  readonly warnings: readonly string[];
}
