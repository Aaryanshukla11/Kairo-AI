import { EmbeddingSourceType } from './embeddingTypes';

export interface EmbeddingJob {
  sourceId: string;
  sourceType: EmbeddingSourceType;
  content: string;
}

export class EmbeddingQueue {
  private queue: EmbeddingJob[] = [];
  private activeJobs = new Set<string>();

  /**
   * Pushes a job to the queue if it's not already present.
   */
  public enqueue(job: EmbeddingJob): boolean {
    const exists = this.queue.some(j => j.sourceId === job.sourceId);
    if (exists) return false;

    this.queue.push(job);
    return true;
  }

  public dequeue(): EmbeddingJob | null {
    if (this.queue.length === 0) return null;
    return this.queue.shift() || null;
  }

  public markActive(sourceId: string): void {
    this.activeJobs.add(sourceId);
  }

  public markInactive(sourceId: string): void {
    this.activeJobs.delete(sourceId);
  }

  public isActive(sourceId: string): boolean {
    return this.activeJobs.has(sourceId);
  }

  public getPending(): EmbeddingJob[] {
    return [...this.queue];
  }

  public clear(): void {
    this.queue = [];
    this.activeJobs.clear();
  }
}
