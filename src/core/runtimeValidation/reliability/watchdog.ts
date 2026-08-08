export class Watchdog {
  private activeLocks = new Set<string>();

  public registerSession(sessionId: string): void {
    this.activeLocks.add(sessionId);
  }

  public unregisterSession(sessionId: string): void {
    this.activeLocks.delete(sessionId);
  }

  public checkHangup(sessionId: string, durationMs: number): boolean {
    // If request runs longer than 10 seconds, it's flagged as stuck
    if (this.activeLocks.has(sessionId) && durationMs > 10000) {
      return true; // Hangup detected
    }
    return false;
  }
}

export const watchdog = new Watchdog();
