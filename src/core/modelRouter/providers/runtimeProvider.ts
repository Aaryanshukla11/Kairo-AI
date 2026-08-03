export class RuntimeProvider {
  public getAvailableRamGb(): number {
    // Return standard system memory bounds
    return 16;
  }
}
