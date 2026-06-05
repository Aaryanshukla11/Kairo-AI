export interface WorkspaceSummary {
  projectName: string;
  framework: string;
  language: string;
  packageManager: string;
  buildTool: string;
  gitEnabled: boolean;
  entryPoint: string;
  sourceFolder: string;
  configurationFiles: string[];
}
