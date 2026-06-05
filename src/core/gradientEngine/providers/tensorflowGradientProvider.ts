import { TensorGradientModel } from '../gradientTypes';

export class TensorflowGradientProvider {
  public extractTapeGradients(): TensorGradientModel[] {
    return [
      { layerName: 'dense/kernel:0', gradNorm: 0.165, gradMean: 0.0025, gradVariance: 0.00045, gradDensity: 0.98, values: [0.012, -0.022, 0.007] }
    ];
  }
}

export const tensorflowGradientProvider = new TensorflowGradientProvider();
export default tensorflowGradientProvider;
