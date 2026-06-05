import { ExecutionContext } from './executionContextTypes';
import { workspaceStateAnalyzer } from './workspaceStateAnalyzer';
import { gitStateAnalyzer } from './gitStateAnalyzer';
import { systemStateAnalyzer } from './systemStateAnalyzer';
import { terminalStateAnalyzer } from './terminalStateAnalyzer';
import { lockDetector } from './lockDetector';

export class ExecutionContextEngine {
  public async getContext(): Promise<ExecutionContext> {
    return {
      workspaceStatus: gitStateAnalyzer.getUncommittedChangesCount() === 0 ? 'clean' : 'dirty',
      gitStatus: gitStateAnalyzer.getGitStatus(),
      currentBranch: gitStateAnalyzer.getCurrentBranch(),
      uncommittedChanges: gitStateAnalyzer.getUncommittedChangesCount(),
      activeEditors: workspaceStateAnalyzer.getActiveEditors(),
      lockedFiles: lockDetector.getLockedFiles(),
      backgroundTasks: terminalStateAnalyzer.getBackgroundTasks(),
      runningTerminalCommands: terminalStateAnalyzer.getRunningCommands(),
      os: systemStateAnalyzer.getOS(),
      diskSpace: systemStateAnalyzer.getDiskSpace(),
      memory: systemStateAnalyzer.getMemory(),
      cpuLoad: systemStateAnalyzer.getCPULoad(),
      workspaceSnapshotId: `snap-${Date.now()}`,
      currentUser: process.env.USER || process.env.USERNAME || 'unknown',
      executionTimestamp: Date.now()
    };
  }
}
export const executionContextEngine = new ExecutionContextEngine();
