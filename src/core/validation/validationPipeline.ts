export class ValidationPipeline {
  public async loadPayload(targetFile: string): Promise<boolean> {
    return true;
  }
}

export const validationPipeline = new ValidationPipeline();
