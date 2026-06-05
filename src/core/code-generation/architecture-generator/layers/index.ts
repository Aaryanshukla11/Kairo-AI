import { ILayerBoundary } from '../schema';

export class LayerDesigner {
  public designLayers(architecture: string): ILayerBoundary[] {
    const layers: ILayerBoundary[] = [];

    layers.push({
      name: 'Presentation Layer',
      responsibilities: ['Render views layouts', 'Capture user inputs actions', 'Delegate calls to Application controllers'],
      allowedDependencies: ['Application Layer', 'Shared Layer'],
      forbiddenDependencies: ['Infrastructure Layer', 'Persistence Layer']
    });

    layers.push({
      name: 'Application Layer',
      responsibilities: ['Orchestrate business use cases actions', 'Coordinate transaction states', 'Dispatch event alerts'],
      allowedDependencies: ['Domain Layer', 'Shared Layer'],
      forbiddenDependencies: ['Presentation Layer']
    });

    layers.push({
      name: 'Domain Layer',
      responsibilities: ['Represent entity validations models', 'Enforce core business logic rules'],
      allowedDependencies: ['Shared Layer'],
      forbiddenDependencies: ['Presentation Layer', 'Application Layer', 'Infrastructure Layer']
    });

    layers.push({
      name: 'Infrastructure Layer',
      responsibilities: ['Implement adapters for external gateways', 'Configure persistence databases drivers'],
      allowedDependencies: ['Domain Layer', 'Shared Layer'],
      forbiddenDependencies: ['Presentation Layer']
    });

    return layers;
  }
}

export const layerDesigner = new LayerDesigner();
export default layerDesigner;
