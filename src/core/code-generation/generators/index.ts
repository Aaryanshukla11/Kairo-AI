import { IGenerator, IGenerationContext } from '../interfaces';

export abstract class BaseGenerator implements IGenerator {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly version: string;
  public abstract readonly description: string;
  public abstract readonly supportedLanguages: string[];
  public abstract readonly supportedFrameworks: string[];
  public abstract readonly supportedProjectTypes: string[];
  public abstract readonly priority: number;
  public abstract readonly dependencies: string[];

  public abstract execute(context: IGenerationContext): Promise<IGenerationContext>;

  public async validate(context: IGenerationContext): Promise<{ valid: boolean; errors: string[] }> {
    return { valid: true, errors: [] };
  }

  public async rollback(context: IGenerationContext): Promise<IGenerationContext> {
    return context;
  }

  public async dispose(): Promise<void> {
    // Cleanup allocated resources
  }

  public async health(): Promise<{ status: 'healthy' | 'unhealthy' }> {
    return { status: 'healthy' };
  }
}
