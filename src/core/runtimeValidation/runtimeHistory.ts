import { InferenceReplaySession } from './runtimeTypes';

export class RuntimeHistory {
  private replaySessions = new Map<string, InferenceReplaySession>();

  public saveReplaySession(session: InferenceReplaySession): void {
    this.replaySessions.set(session.sessionId, { ...session });
  }

  public getReplaySession(sessionId: string): InferenceReplaySession | undefined {
    return this.replaySessions.get(sessionId);
  }

  public listReplaySessions(): InferenceReplaySession[] {
    return Array.from(this.replaySessions.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  public clear(): void {
    this.replaySessions.clear();
  }
}

export const runtimeHistory = new RuntimeHistory();
