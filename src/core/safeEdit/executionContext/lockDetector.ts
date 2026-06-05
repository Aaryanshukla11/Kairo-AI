export class LockDetector {
  public getLockedFiles(): string[] {
    return [];
  }
  public isLocked(filePath: string): boolean {
    return false;
  }
}
export const lockDetector = new LockDetector();
