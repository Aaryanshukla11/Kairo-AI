export class RetryExecutor {
  public async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    onAttemptFailed: (error: any, attempt: number) => void
  ): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (error: any) {
        attempt++;
        onAttemptFailed(error, attempt);
        if (attempt > maxRetries) {
          throw error;
        }
      }
    }
  }
}

export const retryExecutor = new RetryExecutor();
export default retryExecutor;
