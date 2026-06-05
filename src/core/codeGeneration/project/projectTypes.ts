export interface ProjectRequirements {
  prompt: string;
  projectType: string;
  domain: string;
  features: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  uiRequirements: string[];
  authenticationRequirements: string;
  databaseRequirements: string;
  deploymentRequirements: string;
  userPreferences: Record<string, any>;
}

export interface TechnologyStack {
  frontend: 'React' | 'Next.js' | 'Vue' | 'Svelte' | 'Angular';
  backend: 'Express' | 'NestJS' | 'FastAPI' | 'Django' | 'Spring Boot' | 'Laravel';
  database: 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'SQLite';
  authentication: 'JWT' | 'OAuth' | 'Clerk' | 'Auth.js';
  deployment: 'Docker' | 'Vercel' | 'Netlify' | 'AWS' | 'Azure' | 'GCP';
}

export interface FolderNode {
  name: string;
  type: 'file' | 'dir';
  children?: FolderNode[];
  content?: string;
}

export interface ProjectArchitecture {
  folderStructure: FolderNode;
  routing: string[];
  services: string[];
  components: string[];
  stateManagement: string;
  apiStructure: string;
}

export interface ProjectBlueprint {
  directoryTree: string;
  fileList: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  envVariables: Record<string, string>;
  buildConfig: Record<string, any>;
}

export interface GeneratedProject {
  requirements: ProjectRequirements;
  stack: TechnologyStack;
  architecture: ProjectArchitecture;
  blueprint: ProjectBlueprint;
  files: Record<string, string>; // path -> content
  logs: string[];
}
