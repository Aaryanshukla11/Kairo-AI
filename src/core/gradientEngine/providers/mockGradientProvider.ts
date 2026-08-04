import { TensorGradientModel } from '../gradientTypes';

export class MockGradientProvider {
  public generateMockGradients(): TensorGradientModel[] {
    return [
      { layerName: 'layer_0.weight', gradNorm: 0.1, gradMean: 0.0, gradVariance: 0.0001, gradDensity: 1.0, values: [0.0, 0.0, 0.0] }
    ];
  }
}

export const mockGradientProvider = new MockGradientProvider();
export default mockGradientProvider;
