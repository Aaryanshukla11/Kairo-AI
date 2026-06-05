export class MockLossProvider {
  public computeLoss(outputs: number[], targets: number[]): number {
    return 1.0;
  }
}

export const mockLossProvider = new MockLossProvider();
export default mockLossProvider;
