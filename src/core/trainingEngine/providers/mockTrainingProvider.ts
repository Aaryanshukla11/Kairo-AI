export class MockTrainingProvider {
  public executeMockStep(batchId: number): { loss: number; gpuUsage: number; vram: number } {
    const loss = parseFloat((2.5 / (1 + batchId * 0.005) + Math.random() * 0.02).toFixed(4));
    return {
      loss,
      gpuUsage: 85.0,
      vram: 8192
    };
  }
}

export const mockTrainingProvider = new MockTrainingProvider();
export default mockTrainingProvider;
