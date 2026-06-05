export class TransactionMetrics {
  private totalOpen = 0;
  private totalCommits = 0;
  private totalRollbacks = 0;

  public recordOpen(): void {
    this.totalOpen++;
  }
  public recordCommit(): void {
    this.totalCommits++;
  }
  public recordRollback(): void {
    this.totalRollbacks++;
  }

  public getStats() {
    return {
      totalOpen: this.totalOpen,
      totalCommits: this.totalCommits,
      totalRollbacks: this.totalRollbacks
    };
  }
}
export const transactionMetrics = new TransactionMetrics();
