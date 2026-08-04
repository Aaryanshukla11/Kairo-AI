import { FineTuningSessionModel, FineTuningMethod, TrainableParametersReport } from './fineTuningTypes';

export class FineTuningSessionManager {
  private sessions: Map<string, FineTuningSessionModel> = new Map();

  public createSession(
    sessionId: string,
    baseModelId: string,
    method: FineTuningMethod,
    totalEpochs: number,
    totalSteps: number,
    trainableParams: TrainableParametersReport
  ): FineTuningSessionModel {
    const session: FineTuningSessionModel = {
      sessionId,
      baseModelId,
      method,
      status: 'initialized',
      currentEpoch: 0,
      currentStep: 0,
      totalEpochs,
      totalSteps,
      trainableParams,
      startTime: Date.now()
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  public getSession(sessionId: string): FineTuningSessionModel | undefined {
    return this.sessions.get(sessionId);
  }

  public updateSession(sessionId: string, updates: Partial<FineTuningSessionModel>): FineTuningSessionModel {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found.`);
    }
    const updated = { ...session, ...updates };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  public clear(): void {
    this.sessions.clear();
  }
}

export const fineTuningSessionManager = new FineTuningSessionManager();
export default fineTuningSessionManager;
