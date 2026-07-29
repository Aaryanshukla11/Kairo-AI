export class RollbackVerifier {
  public verifySnapshots(snapshots: string[]): boolean {
    return snapshots.length > 0;
  }
}
export const rollbackVerifier = new RollbackVerifier();
