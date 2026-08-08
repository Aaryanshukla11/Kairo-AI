import { GeneratorMetadata, LogLevel } from '../types';

export interface IGenerationContext {
  getPrompt(): string;
  getUserPreferences(): Record<string, any>;
  getWorkspacePath(): string;
  getDetectedFramework(): string | null;
  getSelectedStack(): Record<string, string>;
  getArchitecture(): Record<string, any>;
  getGeneratedArtifacts(): Record<string, string>;
  getProgress(): number;
  getCache(): Map<string, any>;
  
  withPrompt(prompt: string): IGenerationContext;
  withUserPreferences(prefs: Record<string, any>): IGenerationContext;
  withWorkspacePath(path: string): IGenerationContext;
  withDetectedFramework(fw: string): IGenerationContext;
  withSelectedStack(stack: Record<string, string>): IGenerationContext;
  withArchitecture(arch: Record<string, any>): IGenerationContext;
  withGeneratedArtifacts(artifacts: Record<string, string>): IGenerationContext;
  withProgress(progress: number): IGenerationContext;
  withCacheItem(key: string, val: any): IGenerationContext;
}

export interface IGenerator extends GeneratorMetadata {
  execute(context: IGenerationContext): Promise<IGenerationContext>;
  validate(context: IGenerationContext): Promise<{ valid: boolean; errors: string[] }>;
  rollback(context: IGenerationContext): Promise<IGenerationContext>;
  dispose(): Promise<void>;
  health(): Promise<{ status: 'healthy' | 'unhealthy'; details?: string }>;
}

export interface IGeneratorRegistry {
  register(generator: IGenerator): void;
  unregister(id: string): void;
  resolve(id: string): IGenerator | undefined;
  execute(id: string, context: IGenerationContext): Promise<IGenerationContext>;
  list(): IGenerator[];
  metadata(id: string): GeneratorMetadata | undefined;
  version(id: string): string | undefined;
  capabilities(id: string): string[];
  priority(id: string): number | undefined;
  dependencies(id: string): string[];
}

export interface IPipelineStage {
  name: string;
  execute(context: IGenerationContext): Promise<IGenerationContext>;
}

export interface IPipeline {
  addStage(stage: IPipelineStage): void;
  execute(context: IGenerationContext): Promise<IGenerationContext>;
}

export interface ILogger {
  trace(message: string, context?: any): void;
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, context?: any): void;
}

export interface IEventBus {
  publish<T = any>(eventType: string, payload: T): void;
  subscribe<T = any>(eventType: string, listener: (payload: T) => void): () => void;
}
