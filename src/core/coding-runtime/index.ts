import { runtimeController } from './runtime';
import { IGeneratorSession } from '../generator-session-builder/types';
import { IRuntimeResponse, ICodingModelProvider, IRuntimeConfig } from './types';

export class CodingRuntime {
  public async execute(
    session: IGeneratorSession,
    provider: ICodingModelProvider,
    config: IRuntimeConfig = { timeoutMs: 90000, maxRetries: 3 },
    onChunk?: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<IRuntimeResponse> {
    const response = await runtimeController.executeSession(session, provider, config, onChunk, signal);
    return this.deepFreeze(response);
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

export const codingRuntime = new CodingRuntime();
export default codingRuntime;
export * from './types';
export { RuntimeController } from './runtime';
