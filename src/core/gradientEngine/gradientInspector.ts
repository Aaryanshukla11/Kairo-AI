import { TensorGradientModel } from './gradientTypes';

export class GradientInspector {
  public inspectLayer(
    layers: TensorGradientModel[],
    layerName: string
  ): TensorGradientModel | undefined {
    return layers.find(l => l.layerName === layerName);
  }
}

export const gradientInspector = new GradientInspector();
export default gradientInspector;
