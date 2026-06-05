import { inferenceEvents } from './inferenceEvents';
import { InferenceEventType } from './inferenceTypes';

export type TokenCallback = (token: string) => void;

export class InferenceStream {
  private chunks: string[] = [];

  public emitToken(sessionId: string, token: string, callback?: TokenCallback): void {
    this.chunks.push(token);
    if (callback) {
      callback(token);
    }
    inferenceEvents.emit(InferenceEventType.TokenEmitted, sessionId, { token });
  }

  public getFullText(): string {
    return this.chunks.join('');
  }

  public getChunkCount(): number {
    return this.chunks.length;
  }

  public clear(): void {
    this.chunks = [];
  }
}
