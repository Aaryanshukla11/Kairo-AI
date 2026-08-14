import { IStructuredRepairIssue } from '../reviewer/reviewerTypes';
import { globalKairoEventBus } from '../../eventBus/runtime/kairoEventBus';

export interface IRepairContext {
  filePath: string;
  originalContent: string;
  issue: IStructuredRepairIssue;
  attemptNumber: number;
}

export class IterativeRepairLoop {
  public static readonly MAX_REPAIR_ATTEMPTS = 2;

  public async runRepairLoop(
    repairContext: IRepairContext,
    repairFn: (ctx: IRepairContext) => Promise<{ success: boolean; repairedContent: string }>
  ): Promise<{ success: boolean; finalContent: string; attempts: number }> {
    let currentAttempt = 1;
    let content = repairContext.originalContent;
    let isRepaired = false;

    while (currentAttempt <= IterativeRepairLoop.MAX_REPAIR_ATTEMPTS && !isRepaired) {
      console.log(`[IterativeRepairLoop] Starting Repair Attempt ${currentAttempt}/${IterativeRepairLoop.MAX_REPAIR_ATTEMPTS} for '${repairContext.filePath}'...`);

      await globalKairoEventBus.publish({
        eventId: `evt-repair-start-${repairContext.filePath}-${Date.now()}`,
        eventType: 'RepairStarted',
        timestamp: Date.now(),
        source: 'IterativeRepairLoop',
        priority: 'HIGH',
        correlationId: `repair-${Date.now()}`,
        sessionId: `session-repair`,
        payload: {
          filePath: repairContext.filePath,
          attempt: currentAttempt,
          issue: repairContext.issue
        }
      });

      try {
        const result = await repairFn({ ...repairContext, originalContent: content, attemptNumber: currentAttempt });
        if (result.success) {
          isRepaired = true;
          content = result.repairedContent;
          console.log(`[IterativeRepairLoop] Repair Attempt ${currentAttempt} PASSED for '${repairContext.filePath}'.`);

          await globalKairoEventBus.publish({
            eventId: `evt-repair-done-${repairContext.filePath}-${Date.now()}`,
            eventType: 'RepairCompleted',
            timestamp: Date.now(),
            source: 'IterativeRepairLoop',
            priority: 'HIGH',
            correlationId: `repair-${Date.now()}`,
            sessionId: `session-repair`,
            payload: { filePath: repairContext.filePath, attempt: currentAttempt, status: 'REPAIRED' }
          });

          return { success: true, finalContent: content, attempts: currentAttempt };
        }
      } catch (err: any) {
        console.warn(`[IterativeRepairLoop] Repair Attempt ${currentAttempt} FAILED for '${repairContext.filePath}':`, err.message);
      }

      currentAttempt++;
    }

    await globalKairoEventBus.publish({
      eventId: `evt-repair-failed-${repairContext.filePath}-${Date.now()}`,
      eventType: 'RepairFailed',
      timestamp: Date.now(),
      source: 'IterativeRepairLoop',
      priority: 'CRITICAL',
      correlationId: `repair-${Date.now()}`,
      sessionId: `session-repair`,
      payload: { filePath: repairContext.filePath, attempts: currentAttempt - 1, status: 'MAX_RETRY_EXCEEDED' }
    });

    return { success: false, finalContent: content, attempts: currentAttempt - 1 };
  }
}

export const iterativeRepairLoop = new IterativeRepairLoop();
