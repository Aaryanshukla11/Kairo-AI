export class ReviewCoordinator {
  public async scheduleReview(targetFile: string): Promise<boolean> {
    return true;
  }
}

export const reviewCoordinator = new ReviewCoordinator();
