import { pipelineController } from './controller';
import { pipelineEventBus } from './event-bus';

export class PipelineControllerFacade {
  public async run(rawPrompt: string, workspacePath?: string, provider?: any, codingProvider?: any, fsAdapter?: any): Promise<any> {
    const result = await pipelineController.run(rawPrompt, workspacePath, provider, codingProvider, fsAdapter);
    return this.deepFreeze(result);
  }

  public async runPipeline(rawPrompt: string, workspacePath?: string, provider?: any, codingProvider?: any, fsAdapter?: any): Promise<any> {
    return this.run(rawPrompt, workspacePath, provider, codingProvider, fsAdapter);
  }

  public stopPipeline(): void {
    pipelineController.stop();
  }

  public subscribe(eventType: string, handler: any): void {
    pipelineEventBus.subscribe(eventType, handler);
  }

  public unsubscribe(eventType: string, handler: any): void {
    pipelineEventBus.unsubscribe(eventType, handler);
  }

  private deepFreeze<T>(obj: T): T {
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  }
}

export const pipelineControllerFacade = new PipelineControllerFacade();
export default pipelineControllerFacade;
export * from './types';
export { PipelineController } from './controller';
export { PipelineEventBus } from './event-bus';
