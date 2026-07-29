import { TransactionJournalEntry } from './transactionTypes';

export class TransactionJournal {
  private log: TransactionJournalEntry[] = [];

  public append(entry: TransactionJournalEntry): void {
    this.log.push(entry);
  }

  public getEntries(transactionId: string): TransactionJournalEntry[] {
    return this.log.filter(e => e.transactionId === transactionId);
  }

  public clear(): void {
    this.log = [];
  }

  public getAll(): TransactionJournalEntry[] {
    return this.log;
  }
}
export const transactionJournal = new TransactionJournal();
