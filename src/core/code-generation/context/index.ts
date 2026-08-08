import { IGenerationContext } from '../interfaces';

export class GenerationContext implements IGenerationContext {
  private readonly prompt: string;
  private readonly userPreferences: Record<string, any>;
  private readonly workspacePath: string;
  private readonly detectedFramework: string | null;
  private readonly selectedStack: Record<string, string>;
  private readonly architecture: Record<string, any>;
  private readonly generatedArtifacts: Record<string, string>;
  private readonly progress: number;
  private readonly cache: Map<string, any>;

  constructor(
    prompt: string = '',
    userPreferences: Record<string, any> = {},
    workspacePath: string = '',
    detectedFramework: string | null = null,
    selectedStack: Record<string, string> = {},
    architecture: Record<string, any> = {},
    generatedArtifacts: Record<string, string> = {},
    progress: number = 0,
    cache: Map<string, any> = new Map()
  ) {
    this.prompt = prompt;
    this.userPreferences = { ...userPreferences };
    this.workspacePath = workspacePath;
    this.detectedFramework = detectedFramework;
    this.selectedStack = { ...selectedStack };
    this.architecture = { ...architecture };
    this.generatedArtifacts = { ...generatedArtifacts };
    this.progress = progress;
    this.cache = new Map(cache);
  }

  public getPrompt(): string {
    return this.prompt;
  }

  public getUserPreferences(): Record<string, any> {
    return { ...this.userPreferences };
  }

  public getWorkspacePath(): string {
    return this.workspacePath;
  }

  public getDetectedFramework(): string | null {
    return this.detectedFramework;
  }

  public getSelectedStack(): Record<string, string> {
    return { ...this.selectedStack };
  }

  public getArchitecture(): Record<string, any> {
    return { ...this.architecture };
  }

  public getGeneratedArtifacts(): Record<string, string> {
    return { ...this.generatedArtifacts };
  }

  public getProgress(): number {
    return this.progress;
  }

  public getCache(): Map<string, any> {
    return new Map(this.cache);
  }

  public withPrompt(prompt: string): IGenerationContext {
    return new GenerationContext(
      prompt,
      this.userPreferences,
      this.workspacePath,
      this.detectedFramework,
      this.selectedStack,
      this.architecture,
      this.generatedArtifacts,
      this.progress,
      this.cache
    );
  }

  public withUserPreferences(prefs: Record<string, any>): IGenerationContext {
    return new GenerationContext(
      this.prompt,
      prefs,
      this.workspacePath,
      this.detectedFramework,
      this.selectedStack,
      this.architecture,
      this.generatedArtifacts,
      this.progress,
      this.cache
    );
  }

  public withWorkspacePath(path: string): IGenerationContext {
    return new GenerationContext(
      this.prompt,
      this.userPreferences,
      path,
      this.detectedFramework,
      this.selectedStack,
      this.architecture,
      this.generatedArtifacts,
      this.progress,
      this.cache
    );
  }

  public withDetectedFramework(fw: string): IGenerationContext {
    return new GenerationContext(
      this.prompt,
      this.userPreferences,
      this.workspacePath,
      fw,
      this.selectedStack,
      this.architecture,
      this.generatedArtifacts,
      this.progress,
      this.cache
    );
  }

  public withSelectedStack(stack: Record<string, string>): IGenerationContext {
    return new GenerationContext(
      this.prompt,
      this.userPreferences,
      this.workspacePath,
      this.detectedFramework,
      stack,
      this.architecture,
      this.generatedArtifacts,
      this.progress,
      this.cache
    );
  }

  public withArchitecture(arch: Record<string, any>): IGenerationContext {
    return new GenerationContext(
      this.prompt,
      this.userPreferences,
      this.workspacePath,
      this.detectedFramework,
      this.selectedStack,
      arch,
      this.generatedArtifacts,
      this.progress,
      this.cache
    );
  }

  public withGeneratedArtifacts(artifacts: Record<string, string>): IGenerationContext {
    return new GenerationContext(
      this.prompt,
      this.userPreferences,
      this.workspacePath,
      this.detectedFramework,
      this.selectedStack,
      this.architecture,
      artifacts,
      this.progress,
      this.cache
    );
  }

  public withProgress(progress: number): IGenerationContext {
    return new GenerationContext(
      this.prompt,
      this.userPreferences,
      this.workspacePath,
      this.detectedFramework,
      this.selectedStack,
      this.architecture,
      this.generatedArtifacts,
      progress,
      this.cache
    );
  }

  public withCacheItem(key: string, val: any): IGenerationContext {
    const nextCache = new Map(this.cache);
    nextCache.set(key, val);
    return new GenerationContext(
      this.prompt,
      this.userPreferences,
      this.workspacePath,
      this.detectedFramework,
      this.selectedStack,
      this.architecture,
      this.generatedArtifacts,
      this.progress,
      nextCache
    );
  }
}
