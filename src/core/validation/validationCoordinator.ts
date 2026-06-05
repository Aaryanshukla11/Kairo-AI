export class ValidationCoordinator {
  public async coordinate(targetFile: string): Promise<boolean> {
    return true;
  }
}

export const validationCoordinator = new ValidationCoordinator();
