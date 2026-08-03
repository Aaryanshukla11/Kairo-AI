export class SchedulerManager {
  private allowedSchedulers = ['cosine', 'linear', 'constant'];

  public isValid(scheduler: string): boolean {
    return this.allowedSchedulers.includes(scheduler);
  }

  public listAllowed(): string[] {
    return [...this.allowedSchedulers];
  }
}

export const schedulerManager = new SchedulerManager();
export default schedulerManager;
